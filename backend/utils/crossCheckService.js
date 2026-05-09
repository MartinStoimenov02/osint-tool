const axios = require('axios');

const checkEmailBreaches = async (email) => {
    try {
        // Проверяваме дали имаш API ключ за HaveIBeenPwned в .env файла
        if (!process.env.HIBP_API_KEY) {
            return { 
                email, 
                status: 'skipped', 
                message: 'Липсва HIBP_API_KEY в .env файла' 
            };
        }

        const response = await axios.get(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`, {
            headers: {
                'hibp-api-key': process.env.HIBP_API_KEY,
                'user-agent': 'OSI-HR-CrossCheck-Tool'
            }
        });

        // Ако върне 200 OK, значи имейлът Е намерен в хакерски дъмп!
        // Връщаме имената на платформите, от които е изтекъл.
        const breaches = response.data.map(breach => ({
            name: breach.Name,
            domain: breach.Domain,
            date: breach.BreachDate,
            dataClasses: breach.DataClasses // Какво е изтекло (Пароли, IP-та, Имена)
        }));

        return { email, status: 'breached', breaches };

    } catch (error) {
        if (error.response && error.response.status === 404) {
            // Статус 404 при HIBP означава, че имейлът е ЧИСТ! (Няма го в базите)
            return { email, status: 'clean', breaches: [] };
        }
        
        // За всякакви други грешки (напр. Rate limit)
        return { email, status: 'error', message: error.message };
    }
};

module.exports = {
    checkEmailBreaches
};