const axios = require('axios');
require('dotenv').config();

const searchByDomain = async (domain) => {
    const apiKey = process.env.HUNTER_API_KEY;
    const url = `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${apiKey}`;
    
    const response = await axios.get(url);
    return response.data;
};

const findEmail = async (firstName, lastName, domain) => {
    try {
        const apiKey = process.env.HUNTER_API_KEY;
        const response = await axios.get(`https://api.hunter.io/v2/email-finder`, {
            params: {
                first_name: firstName,
                last_name: lastName,
                domain: domain,
                api_key: apiKey
            }
        });
        return response.data.data;
    } catch (error) {
        throw new Error(`Hunter Finder Error: ${error.response?.data?.errors?.[0]?.details || error.message}`);
    }
};

module.exports = {
    searchByDomain,
    findEmail
};