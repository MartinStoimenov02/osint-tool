const socialScanner = require('../utils/socialScanner');

const scanUsername = async (req, res) => {
    try {
        const { username } = req.query;
        if (!username) {
            // Сменяме текстовото съобщение със системен код
            return res.status(400).json({ error: 'MISSING_USERNAME' });
        }

        console.log(`OSI-HR: Scanning socials for username - ${username}`);
        
        const results = await socialScanner.scanAllSocials(username);

        // Сортираме: първо намерените, после ненамерените
        results.sort((a, b) => {
            if (a.status === 'FOUND' && b.status !== 'FOUND') return -1;
            if (a.status !== 'FOUND' && b.status === 'FOUND') return 1;
            return 0;
        });

        return res.status(200).json({ target: username, results });

    } catch (error) {
        console.error("Social Scanner Error:", error.message);
        // Сменяме съобщението за сървърна грешка
        return res.status(500).json({ error: 'SOCIAL_SCAN_ERROR' });
    }
};

module.exports = { scanUsername };