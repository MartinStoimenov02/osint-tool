const axios = require('axios');

const getHeaders = () => {
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'OSINT-Thesis-Tool'
    };

    if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN.trim()}`;
    }
    
    return headers;
};

const searchUsersByName = async (query) => {
    const url = `https://api.github.com/search/users?q=${encodeURIComponent(query)}&per_page=100`;
    const response = await axios.get(url, { headers: getHeaders() });
    return response.data;
};

const getUserDetails = async (username) => {
    const response = await axios.get(`https://api.github.com/users/${username}`, { headers: getHeaders() });
    return response.data;
};

const getUserRepos = async (username) => {
    const response = await axios.get(`https://api.github.com/users/${username}/repos?sort=pushed`, { headers: getHeaders() });
    return response.data;
};

const getRepoCommits = async (username, repoName) => {
    const response = await axios.get(`https://api.github.com/repos/${username}/${repoName}/commits`, { headers: getHeaders() });
    return response.data;
};

// --- НОВО: Извличане на Gist-ове ---
const getUserGists = async (username) => {
    const response = await axios.get(`https://api.github.com/users/${username}/gists`, { headers: getHeaders() });
    return response.data;
};

module.exports = {
    searchUsersByName,
    getUserDetails,
    getUserRepos,
    getRepoCommits,
    getUserGists // Експортираме го
};