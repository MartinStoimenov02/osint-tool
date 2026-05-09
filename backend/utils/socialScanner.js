const axios = require('axios');

const axiosConfig = {
    timeout: 6000,
    headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/json'
    }
};

const platforms = [
    { id: 'github', name: 'GitHub', checkUrl: 'https://api.github.com/users/{username}', profileUrl: 'https://github.com/{username}', type: 'api' },
    { id: 'reddit', name: 'Reddit', checkUrl: 'https://www.reddit.com/user/{username}/about.json', profileUrl: 'https://www.reddit.com/user/{username}', type: 'api' },
    { id: 'hackernews', name: 'HackerNews', checkUrl: 'https://hacker-news.firebaseio.com/v0/user/{username}.json', profileUrl: 'https://news.ycombinator.com/user?id={username}', type: 'api_hn' },
    { id: 'gitlab', name: 'GitLab', checkUrl: 'https://gitlab.com/api/v4/users?username={username}', profileUrl: 'https://gitlab.com/{username}', type: 'api_gitlab' },
    // НОВО: Променяме LinkedIn и Medium да използват Dorking, за да избегнем Timeout!
    { id: 'linkedin', name: 'LinkedIn', profileUrl: 'https://www.google.com/search?q=site:linkedin.com/in/+"{username}"', type: 'dork' },
    { id: 'medium', name: 'Medium', profileUrl: 'https://www.google.com/search?q=site:medium.com+"@{username}"', type: 'dork' }
];

const scanPlatform = async (username, platform) => {
    // АКО ПЛАТФОРМАТА Е ОТ ТИП DORK, ПРОПУСКАМЕ AXIOS ЗАЯВКАТА И ВРЪЩАМЕ ЛИНКА ВЕДНАГА
    if (platform.type === 'dork') {
        const dorkUrl = platform.profileUrl.replace('{username}', username);
        return { platform: platform.name, url: dorkUrl, status: 'MANUAL_DORK' };
    }

    // За останалите платформи продължаваме с нормалното сканиране
    const url = platform.checkUrl.replace('{username}', username);
    const profile = platform.profileUrl.replace('{username}', username);
    
    try {
        const response = await axios.get(url, axiosConfig);

        if (platform.type === 'api_hn') {
            if (response.data === null) throw new Error("Not Found");
        }
        if (platform.type === 'api_gitlab') {
            if (!response.data || response.data.length === 0) throw new Error("Not Found");
        }

        return { platform: platform.name, url: profile, status: 'FOUND' };
    } catch (error) {
        if (error.response?.status === 404 || error.message === "Not Found") {
            return { platform: platform.name, url: profile, status: 'NOT_FOUND' };
        }
        return { platform: platform.name, url: profile, status: 'BLOCKED_OR_ERROR', details: error.message };
    }
};

const scanAllSocials = async (username) => {
    const promises = platforms.map(p => scanPlatform(username, p));
    const results = await Promise.all(promises);
    return results;
};

module.exports = { scanAllSocials };