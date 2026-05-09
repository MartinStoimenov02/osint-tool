const githubService = require('../utils/githubService');
const aiService = require('../utils/aiService');
// НОВО: Импортираме сървиса за кръстосана проверка на имейли
const crossCheckService = require('../utils/crossCheckService');

// Функция за Фаза 1: Търсене по име (Бърз вариант)
const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Missing search query parameter (q)' });
        }

        const data = await githubService.searchUsersByName(q);

        const extractedItems = data.items.map(user => ({
            login: user.login,
            id: user.id,
            avatar_url: user.avatar_url,
            url: user.html_url
        }));

        return res.status(200).json({
            total_count: data.total_count,
            items: extractedItems
        });

    } catch (error) {
        const statusCode = error.response ? error.response.status : 500;
        return res.status(statusCode).json({
            error: 'Failed to fetch data from GitHub API',
            details: error.message
        });
    }
};

// Функция за Фаза 2: Дълбочинен OSINT + AI Анализ
const analyzeUser = async (req, res) => {
    try {
        const { username, lang } = req.query;

        if (!username) {
            return res.status(400).json({ error: 'Missing username parameter' });
        }

        console.log(`Starting deep analysis for: ${username}...`);

        const [profile, repos, gists] = await Promise.all([
            githubService.getUserDetails(username),
            githubService.getUserRepos(username),
            githubService.getUserGists(username)
        ]);

        if (!profile || !profile.login) {
            return res.status(404).json({ error: 'Потребителят не беше намерен в GitHub.' });
        }

        // ВМЕСТО SET, ИЗПОЛЗВАМЕ ОБЕКТ ЗА БРОЕНЕ НА ЧЕСТОТАТА
        let emailCounts = {}; 
        let repoData = [];
        let commitHours = new Array(24).fill(0);
        let collaboratorsMap = {}; 

        for (const repo of repos) {
            repoData.push({
                name: repo.name,
                language: repo.language,
                description: repo.description
            });

            try {
                const commits = await githubService.getRepoCommits(username, repo.name);
                
                commits.forEach(item => {
                    const email = item.commit.author.email;
                    if (email && !email.includes('noreply.github.com')) {
                        // Броим колко пъти се среща всеки имейл
                        emailCounts[email] = (emailCounts[email] || 0) + 1;
                    }

                    if (item.commit.author.date && email === profile.email || item.author?.login === username) {
                        const date = new Date(item.commit.author.date);
                        commitHours[date.getHours()]++;
                    }

                    if (item.author && item.author.login && item.author.login !== username) {
                        const colabLogin = item.author.login;
                        collaboratorsMap[colabLogin] = (collaboratorsMap[colabLogin] || 0) + 1;
                    }
                });
            } catch (err) {}
        }

        // --- ИНТЕЛИГЕНТНО ФИЛТРИРАНЕ НА ИМЕЙЛИ (СКОРИНГ АЛГОРИТЪМ) ---
        const usernameLower = username.toLowerCase();
        const nameParts = profile.name ? profile.name.toLowerCase().split(' ') : [];

        let scoredEmails = Object.keys(emailCounts).map(email => {
            let score = emailCounts[email]; // Базов резултат = брой комити
            const emailLower = email.toLowerCase();
            
            // Бонус: ако съдържа юзърнейма
            if (emailLower.includes(usernameLower)) score += 100;
            
            // Бонус: ако съдържа част от истинското име
            nameParts.forEach(part => {
                if (part.length > 2 && emailLower.includes(part)) score += 50;
            });

            // Гранд Бонус: ако съвпада с публичния му имейл в профила
            if (profile.email && emailLower === profile.email.toLowerCase()) score += 500;

            return { email, score };
        });

        // Сортираме по най-висок резултат и взимаме САМО ТОП 5
        scoredEmails.sort((a, b) => b.score - a.score);
        const extractedEmailsArr = scoredEmails.slice(0, 5).map(e => e.email);

        const topCollaborators = Object.entries(collaboratorsMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(c => ({ username: c[0], commits_together: c[1] }));

        const suspiciousKeywords = ['.env', 'config', 'secret', 'pass', 'key', 'token', 'credentials', 'cert', 'pem'];
        const analyzedGists = gists.map(g => {
            const fileNames = Object.keys(g.files);
            const hasSuspiciousFiles = fileNames.some(name => 
                suspiciousKeywords.some(keyword => name.toLowerCase().includes(keyword))
            );
            return {
                url: g.html_url,
                files: fileNames,
                flagged_as_secret: hasSuspiciousFiles
            };
        });

        console.log(`Cross-checking ${extractedEmailsArr.length} extracted emails for data breaches...`);
        
        // Вече проверяваме максимум 5 имейла!
        const breachChecks = await Promise.all(
            extractedEmailsArr.map(email => crossCheckService.checkEmailBreaches(email))
        );

        const rawReport = {
            target: username,
            profile: {
                name: profile.name,
                company: profile.company,
                location: profile.location,
                bio: profile.bio
            },
            extracted_emails: extractedEmailsArr, // Подаваме само филтрираните 5 на AI
            repositories: repoData,
            osint_extras: {
                activity_by_hour: commitHours,
                top_collaborators: topCollaborators,
                gists: analyzedGists,
                breach_checks: breachChecks
            }
        };

        console.log(`Sending aggregated data to Gemini AI for profiling in language: ${lang || 'en'}...`);
        
        let aiAnalysis = null;
        try {
            aiAnalysis = await aiService.generateOsintProfile(rawReport, lang);
        } catch (aiError) {
            console.error("Gemini API Error:", aiError.message);
            aiAnalysis = "AI_ANALYSIS_UNAVAILABLE";
        }

        const finalResponse = {
            ...rawReport,
            ai_profiling: aiAnalysis
        };

        console.log(`Analysis complete for ${username}. Sending final response.`);
        return res.status(200).json(finalResponse);

    } catch (error) {
        console.error("Грешка в analyzeUser контролера:", error.message);
        const statusCode = error.response ? error.response.status : 500;
        return res.status(statusCode).json({
            error: 'Failed to analyze user data',
            details: error.message
        });
    }
};

module.exports = {
    searchUsers,
    analyzeUser
};