const hunterService = require('../utils/hunterService');

const searchByDomain = async (req, res) => {
    try {
        const { domain } = req.query;
        if (!domain) {
            // Връща се системен код вместо текст
            return res.status(400).json({ error: 'MISSING_DOMAIN' });
        }

        console.log(`OSI-HR: Searching corporate entity - ${domain}`);
        
        // данните от услугата
        const data = await hunterService.searchByDomain(domain);

        // Връща се целия обект, за да може фронтендът да си визуализира 
        // градове, държави, социални мрежи и всички детайли на служителите
        const resultData = data.data ? data.data : data;
        return res.status(200).json(resultData);

    } catch (error) {
        console.error("Hunter API Error:", error.message);
        return res.status(500).json({ error: 'FAILED_TO_FETCH_DOMAIN' });
    }
};

const findPersonEmail = async (req, res) => {
    try {
        const { firstName, lastName, domain } = req.query;
        if (!firstName || !lastName || !domain) {
            return res.status(400).json({ error: 'MISSING_PERSON_PARAMS' });
        }

        console.log(`OSI-HR: Searching for specific person - ${firstName} ${lastName} @ ${domain}`);
        const data = await hunterService.findEmail(firstName, lastName, domain);

        return res.status(200).json(data);
    } catch (error) {
        console.error("Hunter Finder API Error:", error.message);
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    searchByDomain,
    findPersonEmail
};