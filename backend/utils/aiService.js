const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config(); // Зареждаме ключа от .env файла

// Инициализираме клиента
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateOsintProfile = async (githubRawData, lang = 'bg') => { 
    try {
        // Конфигурираме модела за сложни анализи и структуриран JSON изход
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json", // Задължаваме го да връща чист JSON
                temperature: 0.1 // Ниска температура за максимална прецизност и фактология
            }
        });

        // Инструкция за езика спрямо избора в системата
        const langText = lang === 'bg' ? 'БЪЛГАРСКИ' : 'ENGLISH';

        const prompt = `
        Ти си експертен OSINT анализатор и технически рекрутър. Анализирай предоставените сурови данни от GitHub и генерирай структуриран профил на разработчика.
        
        ВАЖНО: Всички текстови данни в JSON обекта трябва да бъдат написани на ${langText} език.

        Изисквания към JSON изхода:
        {
          "primary_role": "String (Определи типа девелъпър: Backend, Frontend, DevOps, Data Scientist и др. на база репозиториите)",
          "tech_stack": ["Array of Strings (Изброй доминиращите езици и технологии)"],
          "activity_evaluation": "String (Кратка оценка на активността въз основа на броя репозитории и комити)",
          "most_likely_email": "String (Избери най-вероятния реален имейл от предоставените, игнорирай noreply)",
          "employer_summary": "String (Професионално резюме от 3 изречения, оценяващо техническите компетенции за потенциален работодател)"
        }

        Сурови данни за анализ:
        ${JSON.stringify(githubRawData, null, 2)}
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Парсваме върнатия JSON стринг към реален JavaScript обект
        return JSON.parse(responseText);

    } catch (error) {
        console.error("Грешка при комуникацията с Gemini API:", error);
        throw new Error("AI анализът е временно недостъпен.");
    }
};

module.exports = {
    generateOsintProfile
};