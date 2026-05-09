import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  bg: {
    translation: {
      "nav": {
        "login": "Вход",
        "signup": "Регистрация",
        "logout": "Изход",
        "tools": "Инструменти",
        "github_profiler": "GitHub Profiler",
        "corporate_recon": "Corporate Recon",
        "social_scanner": "Social Scanner",
        "saved_profiles": "Запазени Досиета",
        "admin": "Администрация",
        "users": "Потребители",
        "logs": "Логове",
        "feedback": "Обратни връзки",
        "notifications": "Уведомления",
        "help": "Помощ и ЧЗВ"
      },
      "common": {
        "loading": "Зареждане...",
        "save": "Запази",
        "delete": "Изтрий",
        "back": "Назад",
        "close": "Затвори",
        "confirm": "Потвърди",
        "saving": "Запис...",
        "cancel": "Отказ",
        "send": "Изпрати",
        "exportPdf": "Експорт в PDF",
        "edit": "Редактирай",
        "processing": "Обработка...",
        "error": "Възникна неочаквана грешка!"
      },
      "auth": {
        "errors": {
          "userNotFound": "Потребителят не е намерен.",
          "invalidCredentials": "Невалиден имейл адрес или парола!",
          "accountNotApproved": "Вашият профил все още не е одобрен от администратор. Моля, изчакайте.",
          "invalid2faCode": "Невалиден или изтекъл 2FA код.",
          "alreadyEnabled2fa": "2FA вече е активирана за този акаунт.",
          "emailExists": "Този имейл адрес вече се използва!",
          "phoneExists": "Този телефонен номер вече се използва!"
        },
        "messages": {
          "registrationSuccess": "Заявката за регистрация е изпратена успешно!",
          "loginSuccess": "Успешно влизане!"
        }
      },
      "header": {
        "errors": {
          "updateFirstLoginFailed": "Грешка при актуализиране на статуса за първи вход."
        }
      },
      "changePassword": {
        "title": "Смяна на парола",
        "currentPassword": "Текуща парола",
        "newPassword": "Нова парола",
        "newPasswordPlaceholder": "Поне 8 символа",
        "confirmPassword": "Повтори парола",
        "confirmPasswordPlaceholder": "Повторете новата парола",
        "fillAllFields": "Моля, попълнете всички полета.",
        "passwordRegexError": "Паролата трябва да е поне 8 символа с главна, малка буква и цифра.",
        "passwordMismatch": "Новата парола не съвпада!",
        "invalidCurrentPassword": "Невалидна текуща парола!",
        "errors": {
          "invalidCurrentPassword": "Невалидна текуща парола!",
          "passwordUpdateFailed": "Грешка при смяната на паролата."
        }
      },
      "confirmAction": {
        "title": "Потвърждение",
        "approveText": "Сигурни ли сте, че искате да одобрите този потребител и да му дадете достъп?",
        "rejectText": "Сигурни ли сте, че искате да отхвърлите и изтриете тази заявка? Това действие е необратимо.",
        "approveBtn": "Да, одобри",
        "rejectBtn": "Да, отхвърли"
      },
      "confirmDelete": {
        "title": "Потвърждение",
        "text": "Сигурни ли сте, че искате да изтриете тези данни? Това действие е необратимо.",
        "confirmBtn": "Да, изтрий"
      },
      "deleteAccount": {
        "title": "Изтриване на акаунт",
        "warningText": "Това действие е необратимо. Всички ваши данни ще бъдат изтрити завинаги.",
        "confirmEmail": "Потвърдете вашия имейл",
        "passwordLabel": "Парола",
        "passwordPlaceholder": "Вашата парола",
        "emailMismatch": "Имейлът не съвпада с вашия!",
        "passwordRequired": "Моля, въведете парола за потвърждение!",
        "verificationError": "Грешка при верификацията!",
        "deleting": "Изтриване...",
        "deleteBtn": "ИЗТРИЙ",
        "errors": {
          "deleteFailed": "Възникна сървърна грешка при изтриването на вашите данни.",
          "emailMismatch": "Имейлът не съвпада с вашия!",
          "passwordRequired": "Моля, въведете парола за потвърждение!"
        }
      },
      "feedbackModal": {
        "title": "Обратна връзка",
        "messageType": "Тип на съобщението",
        "rating": "Оценка",
        "messageLabel": "Съобщение",
        "messagePlaceholder": "Напишете вашите впечатления тук...",
        "notLoggedIn": "Потребителят не е логнат.",
        "missingType": "Моля, изберете тип обратна връзка!",
        "missingRating": "Моля, изберете рейтинг!",
        "submitError": "Грешка при изпращане.",
        "options": {
          "selectCategory": "Изберете категория...",
          "bugReport": "Доклад за грешка",
          "suggestion": "Предложение",
          "complaint": "Жалба",
          "general": "Обща обратна връзка",
          "help": "Помощ и въпроси"
        },
        "errors": {
          "createFailed": "Грешка при записването на обратната връзка!"
        }
      },
      "footer": {
        "rights": "Всички права запазени."
      },
      "printableReport": {
        "competencies": "Компетенции",
        "languages": "Езици",
        "security": "Сигурност (Cross-Check)",
        "clean": "Чист",
        "breaches": "изтичания",
        "skipped": "Пропусната проверка",
        "aiSummary": "Професионално Резюме (AI)",
        "activityEvaluation": "Оценка на Активността",
        "significantProjects": "Значими Проекти",
        "noDescription": "Няма описание към проекта.",
        "expert": "Експерт:",
        "admin": "Администратор"
      },
      "sendMessage": {
        "title": "Изпрати съобщение",
        "selectedUsers": "Избрани потребители:",
        "placeholder": "Въведи съобщение...",
        "sendEmailCheckbox": "Изпрати и по имейл",
        "emptyMessageError": "Моля, въведете съобщение!",
        "sendError": "Грешка при изпращане на съобщението!",
        "sending": "Изпращане...",
        "errors": {
          "accessDenied": "Достъп отказан! Нямате админски права.",
          "missingFields": "Липсват данни или потребителят не съществува.",
          "emailFailed": "Системната нотификация е създадена, но възникна грешка при изпращането на имейла."
        }
      },
      "sortModal": {
        "title": "Изберете метод за сортиране",
        "nameAsc": "Име (A-Z)",
        "nameDesc": "Име (Z-A)",
        "favourites": "Любими",
        "national100": "Национални 100",
        "distance": "Разстояние"
      },
      "adminFeedback": {
        "title": "Обратна връзка",
        "filter": "Филтър",
        "sortBy": "Сортирай по",
        "date": "Дата",
        "rating": "Оценка",
        "type": "Тип",
        "order": "Ред",
        "newestFirst": "Най-нови първо",
        "oldestFirst": "Най-стари първо",
        "all": "Всички",
        "anonymous": "Анонимен",
        "noMessage": "Без съобщение",
        "table": {
          "user": "Потребител",
          "type": "Тип",
          "message": "Съобщение",
          "rating": "Оценка",
          "date": "Дата",
          "actions": "Действия"
        },
        "errors": {
          "fetchFailed": "Грешка при зареждането на обратната връзка",
          "deleteMultipleFailed": "Грешка при групово изтриване.",
          "deleteFailed": "Грешка при изтриване на записа."
        }
      },
      "adminLogs": {
        "title": "System_Logs.txt",
        "newestFirst": "Най-нови отгоре",
        "oldestFirst": "Най-стари отгоре",
        "wipeSelected": "Wipe Selected",
        "noLogs": "Няма намерени логове в базата данни",
        "table": {
          "userId": "User_ID",
          "status": "Status",
          "eventMessage": "Event_Message",
          "origin": "Origin",
          "timestamp": "Timestamp",
          "action": "Action"
        }
      },
      "adminUsers": {
        "title": "Потребители",
        "searchPlaceholder": "Търсене...",
        "sendMessage": "Изпрати съобщение",
        "selectAtLeastOne": "Моля, изберете поне един потребител!",
        "messageSent": "Съобщението е изпратено успешно!",
        "userApproved": "Потребителят е одобрен успешно!",
        "userRejected": "Потребителят е отхвърлен и изтрит!",
        "pendingApproval": "Чака одобрение",
        "approve": "Одобри",
        "reject": "Отхвърли",
        "userUpdated": "Потребителят е обновен успешно!",
        "filters": {
          "all": "Всички",
          "admins": "Админи",
          "regular": "Обикновени",
          "google": "С Google",
          "noGoogle": "Без Google"
        },
        "sort": {
          "name": "Име",
          "email": "Имейл"
        },
        "table": {
          "name": "Име",
          "phone": "Телефон",
          "email": "Email",
          "google": "Google",
          "admin": "Админ",
          "options": "Опции"
        },
        "errors": {
          "fetchFailed": "Грешка при извличане на потребителите.",
          "updateFailed": "Възникна грешка при обновяване на данните.",
          "actionFailed": "Грешка при опит за промяна на статуса.",
          "selectAtLeastOne": "Моля, изберете поне един потребител!"
        }
      },
      "corporateRecon": {
        "title": "Corporate Recon",
        "subtitle": "Въведете домейн на компания, за да картографирате фирмената структура и вътрешните имейли.",
        "searchPlaceholder": "company.com (напр. stripe.com)",
        "scanning": "Сканиране...",
        "analyze": "Анализ",
        "targetMapped": "Target Mapped",
        "linkedinProfile": "LinkedIn Профил",
        "emailPattern": "Email Шаблон",
        "extractedFromPublic": "Извлечен от публични записи",
        "noPatternFound": "Не е открит ясен модел за имейлите.",
        "sniperTitle": "Снайперист (Direct Target)",
        "sniperSubtitle": "Намерете имейл на конкретен служител",
        "firstNamePlaceholder": "Първо Име (напр. John)",
        "lastNamePlaceholder": "Фамилия (напр. Doe)",
        "searching": "Търсене...",
        "extract": "Извлечи",
        "foundEmail": "Открит Имейл:",
        "confidence": "Увереност",
        "foundEmployees": "Открити Служители",
        "anonymousEmployee": "Анонимен Служител",
        "noEmailsFound": "Не са намерени публични имейли за този домейн.",
        "errors": {
          "invalidDomain": "Моля, въведете валиден домейн (напр. stripe.com)",
          "serverError": "Грешка при комуникацията със сървъра. Проверете API ключа си.",
          "missingName": "Моля, въведете Име и Фамилия.",
          "notFound": "Лицето не беше открито и фирмата няма ясен шаблон за генериране."
        }
      },
      "forgotPassword": {
        "title": "Възстановяване на достъпа",
        "subtitle": "Задайте нова сигурна парола за вашия акаунт, за да продължите работа.",
        "newPasswordTitle": "Нова парола",
        "changingForAccount": "Промяна на паролата за акаунт:",
        "newPasswordLabel": "Нова Парола",
        "newPasswordPlaceholder": "Въведете новата парола",
        "confirmPasswordLabel": "Потвърдете Паролата",
        "confirmPasswordPlaceholder": "Потвърдете новата парола",
        "changePasswordBtn": "Смени паролата",
        "successMessage": "Паролата е променена успешно! Пренасочване към вход...",
        "errors": {
          "passwordMismatch": "Паролите не съвпадат!",
          "passwordRequirements": "Паролата трябва да съдържа поне 8 символа, главна буква, малка буква и цифра.",
          "changeError": "Грешка при промяна на паролата."
        }
      },
      "githubProfiler": {
        "title": "Дълбочинен GitHub Анализ",
        "subtitle": "Използвайте филтрите по-долу, за да намерите точния кандидат. Инструментът ще сканира историята му и ще изготви психологически и технически профил чрез AI.",
        "searchPlaceholder": "Име, Фамилия или GitHub Username...",
        "searchBtn": "Търси",
        "searchingBtn": "Търсене...",
        "filters": {
          "title": "Детайлни филтри",
          "location": "Град (напр. Sofia)",
          "allLanguages": "Всички езици",
          "followers": "Последователи",
          "followersActive": "> 10 (Активни)",
          "followersPopular": "> 50 (Популярни)",
          "followersLeaders": "> 100 (Лидери)",
          "followersInfluencers": "> 500 (Инфлуенсъри)",
          "repos": "Хранилища",
          "repos10": "> 10 проекта",
          "repos30": "> 30 проекта",
          "repos50": "> 50 проекта",
          "createdAfter": "Рег. след",
          "created2023": "След 2023",
          "created2020": "След 2020",
          "created2015": "След 2015"
        },
        "results": {
          "title": "Намерени профили",
          "total": "Общо",
          "githubProfile": "GitHub Профил",
          "analyzeBtn": "Анализ",
          "loadingData": "Извличане на OSINT данни и AI анализ...",
          "loadingWait": "(Това може да отнеме до 30 секунди)"
        },
        "profile": {
          "backBtn": "Назад към резултатите",
          "saved": "Запазено",
          "saveBtn": "Запази Кандидата",
          "targetAcquired": "Target Acquired",
          "openGithub": "Отвори профила на",
          "contactsTitle": "Открити Контакти",
          "extractedFromCommits": "Извлечени от Commit история:",
          "noPublicEmails": "Не са открити публични имейли.",
          "securityTitle": "Cross-Check (Сигурност)",
          "cleanBreach": "✅ Не са намерени изтичания на данни.",
          "skippedBreach": "ℹ️ HIBP API ключът липсва. Проверката е пропусната.",
          "breachFound": "⚠️ Намерени {{count}} изтичания на данни!",
          "moreBreaches": "+{{count}} още",
          "aiTitle": "Gemini AI Анализ",
          "aiSubtitle": "Психологически и Технически Профил",
          "role": "Предполагаема роля:",
          "employerSummary": "💼 Резюме за работодатели",
          "activityEval": "📊 Оценка на активността",
          "techStack": "Разпознати компетенции:",
          "aiEmailGuess": "AI Извод за контакт:",
          "aiNotAvailable": "AI Анализът не е наличен в момента.",
          "dailyActivity": "Дневна Активност",
          "gistScanner": "Gist Скенер (Тайни и Конфигурации)",
          "potentialLeak": "Потенциално изтичане на данни",
          "viewGist": "Преглед",
          "topCollaborators": "Топ Колаборатори",
          "commonCommits": "общи комита",
          "languages": "Използвани Езици",
          "scannedRepos": "Последно сканирани хранилища",
          "noDescription": "Няма описание",
          "showingTop10": "*Показани са първите 10. AI-а е анализирал всички.",
          "pdfGeneratedBy": "Докладът е генериран автоматично от OSI-HR Intelligence Engine",
          "expert": "Експерт:",
          "admin": "Администратор",
          "date": "Дата:"
        },
        "errors": {
          "noCriteria": "Моля, въведете поне един критерий за търсене.",
          "noUsersFound": "Не са намерени потребители по тези критерии.",
          "searchError": "Грешка при търсенето. Сървърът не отговаря.",
          "analyzeError": "Грешка при анализирането на {{username}}. Проверете лимитите на API или сървъра.",
          "alreadySaved": "Този профил вече е запазен.",
          "saveError": "Грешка при запазване на профила.",
          "userNotFoundInGithub": "Потребителят не беше намерен в GitHub.",
          "missingUsername": "Липсва параметър username.",
          "missingData": "Липсват данни за профила.",
        }
      },
      "guestPage": {
        "slide1": {
          "title": "OSINT Анализ за Подбор на Персонал",
          "description": "Профилирайте ИТ кандидати чрез публични дигитални следи и AI анализ, за да вземате информирани HR решения."
        },
        "slide2": {
          "title": "Дълбочинен GitHub Анализ",
          "description": "Търсете разработчици по име. Анализирайте техните хранилища, активност и реален технологичен стек за секунди."
        },
        "slide3": {
          "title": "Корпоративно Разузнаване и Headhunting",
          "description": "Проучвайте конкурентни компании по домейн. Разкривайте организационната им структура и откривайте ключови специалисти."
        }
      },
      "login": {
        "welcome": "Добре дошли, {{name}}!",
        "successLogin": "Успешен вход!",
        "wrongCredentials": "Грешен имейл или парола",
        "notApproved": "Вашият профил все още не е одобрен от администратор.",
        "serverError": "Грешка при свързване със сървъра",
        "googleError": "Грешка при Google вход",
        "invalidCode": "Невалиден код.",
        "verifyCodeError": "Грешка при проверка на кода.",
        "enterEmail": "Моля, въведете имейл адрес.",
        "emailNotFound": "Имейлът не е намерен.",
        "codeSent": "Кодът е изпратен.",
        "sendCodeError": "Грешка при изпращане на кода.",
        "leftPanel": {
          "title": "OSINT Intelligence",
          "subtitle": "Продължете вашето проучване и открийте следващия топ талант."
        },
        "form": {
          "title": "Вход",
          "emailLabel": "Имейл",
          "passwordLabel": "Парола",
          "forgotPassword": "Забравена парола?",
          "authenticating": "Автентикация...",
          "loginBtn": "Влез в системата",
          "or": "ИЛИ",
          "noAccount": "Нямате акаунт?",
          "register": "Регистрация"
        },
        "modalForgot": {
          "title": "Верификация",
          "placeholder": "6-цифрен код"
        },
        "modal2FA": {
          "title": "Двуфакторна защита",
          "description": "Отворете Google Authenticator и въведете 6-цифрения код или използвайте Recovery код.",
          "loginBtn": "Влез"
        }
      },
      "notifications": {
        "noNew": "Нямате нови известия.",
        "errors": {
          "fetchFailed": "Грешка при зареждане на нотификациите",
          "notFound": "Нотификацията не е намерена.",
          "markReadFailed": "Грешка при маркиране на съобщението като прочетено."
        }
      },
      "profile": {
        "userOf": "Потребител на OSI-HR",
        "confirmDisable2FA": "Сигурни ли сте, че искате да изключите двуфакторната защита? Акаунтът ви ще бъде по-уязвим.",
        "fields": {
          "email": "Имейл адрес",
          "name": "Име и Фамилия",
          "phone": "Телефонен номер",
          "noPhone": "Няма добавен телефон"
        },
        "security": {
          "title": "Сигурност",
          "twoFactorTitle": "Двуфакторна автентикация (2FA)",
          "twoFactorDesc": "Допълнителна защита с Google Authenticator.",
          "disableBtn": "Изключи",
          "enableBtn": "Включи"
        },
        "actions": {
          "changePassword": "Смени парола",
          "feedback": "Обратна връзка",
          "deleteAccount": "Изтрий акаунт"
        },
        "modal2FA": {
          "title": "Настройка на 2FA",
          "step1": "1. Сканирайте QR кода с Authenticator приложение",
          "step2Title": "2. ЗАПАЗЕТЕ ТЕЗИ КОДОВЕ!",
          "step2Desc": "Ако загубите достъп до телефона си, тези кодове са единственият начин да влезете. Всеки код може да се използва само веднъж.",
          "step3": "3. Въведете 6-цифрения код от приложението",
          "checking": "Проверка...",
          "confirmBtn": "Потвърди и Активирай"
        },
        "success": {
          "updated": "Обновено успешно!",
          "twoFactorEnabled": "2FA е успешно активирана!",
          "twoFactorDisabled": "2FA е изключена.",
          "feedbackSent": "Благодарим за фийдбека!",
          "passwordChanged": "Паролата е променена!"
        },
        "errors": {
          "invalidPhone": "Невалиден телефонен номер (мин. 10 цифри).",
          "invalidEmail": "Невалиден имейл адрес.",
          "nameRequired": "Името е задължително.",
          "saveError": "Грешка при запис.",
          "generate2FA": "Грешка при генериране на 2FA.",
          "invalid6Digit": "Моля, въведете валиден 6-цифрен код.",
          "invalidCode": "Невалиден код.",
          "verifyError": "Грешка при потвърждаване.",
          "disable2FA": "Грешка при изключване на 2FA.",
          "invalidField": "Невалидно поле за промяна."
        }
      },
      "savedProfiles": {
        "title": "Запазени Досиета",
        "subtitle": "Вашият личен списък с анализирани кандидати ({{count}})",
        "noProfiles": "Нямате запазени кандидати",
        "noProfilesDesc": "Отидете в GitHub Profiler, за да анализирате и запазите профили.",
        "deleteProfileTitle": "Изтрий досието",
        "aiProfile": "AI Профил",
        "foundEmails": "Открити Имейли",
        "andMore": "и още...",
        "location": "Локация",
        "viewDetails": "Виж детайли →",
        "errors": {
          "fetchError": "Грешка при зареждане на запазените профили.",
          "deleteConfirm": "Сигурни ли сте, че искате да премахнете досието на {{target}}?",
          "deleteError": "Възникна грешка при изтриването.",
          "notFound": "Профилът не беше намерен в базата данни."
        }
      },
      "signup": {
        "codeSentMessage": "Имейл с код за верификация е изпратен.",
        "networkError": "Мрежова грешка: Сървърът не отговаря!",
        "googleSuccess": "Успешна регистрация чрез Google за {{name}}",
        "leftPanel": {
          "title": "Присъединете се към нас",
          "subtitle": "Създайте профил и започнете да анализирате данни с мощта на OSINT."
        },
        "form": {
          "title": "Създай профил",
          "submitBtn": "Регистрирай се",
          "alreadyHaveAccount": "Вече имате акаунт?"
        },
        "modalVerify": {
          "subtitle": "Изпратихме код на"
        },
        "modalPending": {
          "title": "Заявката е получена",
          "description": "Благодарим Ви за регистрацията! Вашият профил ще бъде разгледан в рамките на следващите 24 часа. Ще получите имейл потвърждение, веднага щом администратор активира акаунта Ви.",
          "backBtn": "Разбрах, към Вход"
        },
        "errors": {
          "registrationError": "Грешка при финализиране на регистрацията. Моля, опитайте по-късно."
        }
      },
      "socialRecon": {
        "title": "Social Media Recon",
        "subtitle": "Cross-Platform Username Enumeration. Въведете юзърнейм, за да проверите дигиталния му отпечатък в множество платформи едновременно.",
        "placeholder": "потребителско_име (напр. ggerganov)",
        "scanBtn": "СКАНИРАЙ",
        "scanningBtn": "Търсене...",
        "checkingDatabases": "Проверка на бази данни...",
        "resultsFor": "Резултати за: @{{target}}",
        "toProfile": "Към профила",
        "dorkSearch": "Dork Търсене",
        "available": "Свободно / Няма запис",
        "botProtection": "Защита от ботове (Timeout)",
        "errors": {
          "emptyUsername": "Моля, въведете потребителско име.",
          "scanError": "Възникна грешка при сканирането. Сървърът може да е претоварен."
        }
      }
    }
  },
  en: {
    translation: {
      "nav": {
        "login": "Login",
        "signup": "Sign Up",
        "logout": "Logout",
        "tools": "Tools",
        "github_profiler": "GitHub Profiler",
        "corporate_recon": "Corporate Recon",
        "social_scanner": "Social Scanner",
        "saved_profiles": "Saved Profiles",
        "admin": "Administration",
        "users": "Users",
        "logs": "Logs",
        "feedback": "Feedback",
        "notifications": "Notifications",
        "help": "Help & FAQ"
      },
      "common": {
        "loading": "Loading...",
        "save": "Save",
        "delete": "Delete",
        "back": "Back",
        "close": "Close",
        "confirm": "Confirm",
        "saving": "Saving...",
        "cancel": "Cancel",
        "send": "Send",
        "exportPdf": "Export to PDF",
        "edit": "Edit",
        "processing": "Processing...",
        "error": "An unexpected error occurred!"
      },
      "auth": {
        "errors": {
          "userNotFound": "User not found.",
          "invalidCredentials": "Invalid email address or password!",
          "accountNotApproved": "Your profile is not yet approved by an administrator. Please wait.",
          "invalid2faCode": "Invalid or expired 2FA code.",
          "alreadyEnabled2fa": "2FA is already enabled for this account.",
          "emailExists": "This email address is already in use!",
          "phoneExists": "This phone number is already in use!"
        },
        "messages": {
          "registrationSuccess": "Registration request sent successfully!",
          "loginSuccess": "Login successful!"
        }
      },
      "header": {
        "errors": {
          "updateFirstLoginFailed": "Error updating first login status."
        }
      },
      "changePassword": {
        "title": "Change Password",
        "currentPassword": "Current Password",
        "newPassword": "New Password",
        "newPasswordPlaceholder": "At least 8 characters",
        "confirmPassword": "Confirm Password",
        "confirmPasswordPlaceholder": "Confirm your new password",
        "fillAllFields": "Please fill in all fields.",
        "passwordRegexError": "Password must be at least 8 characters long and contain uppercase, lowercase letters, and a number.",
        "passwordMismatch": "New passwords do not match!",
        "invalidCurrentPassword": "Invalid current password!",
        "errors": {
          "invalidCurrentPassword": "Invalid current password!",
          "passwordUpdateFailed": "Error updating password."
        }
      },
      "confirmAction": {
        "title": "Confirmation",
        "approveText": "Are you sure you want to approve this user and grant them access?",
        "rejectText": "Are you sure you want to reject and delete this request? This action is irreversible.",
        "approveBtn": "Yes, approve",
        "rejectBtn": "Yes, reject"
      },
      "confirmDelete": {
        "title": "Confirmation",
        "text": "Are you sure you want to delete this data? This action is irreversible.",
        "confirmBtn": "Yes, delete"
      },
      "deleteAccount": {
        "title": "Delete Account",
        "warningText": "This action is irreversible. All your data will be permanently deleted.",
        "confirmEmail": "Confirm your email",
        "passwordLabel": "Password",
        "passwordPlaceholder": "Your password",
        "emailMismatch": "Email does not match yours!",
        "passwordRequired": "Please enter your password for confirmation!",
        "verificationError": "Verification error!",
        "deleting": "Deleting...",
        "deleteBtn": "DELETE",
        "errors": {
          "deleteFailed": "A server error occurred while deleting your data.",
          "emailMismatch": "Email does not match yours!",
          "passwordRequired": "Please enter a password for confirmation!"
        }
      },
      "feedbackModal": {
        "title": "Feedback",
        "messageType": "Message Type",
        "rating": "Rating",
        "messageLabel": "Message",
        "messagePlaceholder": "Write your impressions here...",
        "notLoggedIn": "User is not logged in.",
        "missingType": "Please select a feedback type!",
        "missingRating": "Please select a rating!",
        "submitError": "Error submitting feedback.",
        "options": {
          "selectCategory": "Select a category...",
          "bugReport": "Bug Report",
          "suggestion": "Suggestion",
          "complaint": "Complaint",
          "general": "General Feedback",
          "help": "Help & Questions"
        },
        "errors": {
          "createFailed": "Error saving feedback!"
        }
      },
      "footer": {
        "rights": "All rights reserved."
      },
      "printableReport": {
        "competencies": "Competencies",
        "languages": "Languages",
        "security": "Security (Cross-Check)",
        "clean": "Clean",
        "breaches": "breaches",
        "skipped": "Skipped check",
        "aiSummary": "Professional Summary (AI)",
        "activityEvaluation": "Activity Evaluation",
        "significantProjects": "Significant Projects",
        "noDescription": "No description available.",
        "expert": "Expert:",
        "admin": "Administrator"
      },
      "sendMessage": {
        "title": "Send Message",
        "selectedUsers": "Selected users:",
        "placeholder": "Enter message...",
        "sendEmailCheckbox": "Send via email too",
        "emptyMessageError": "Please enter a message!",
        "sendError": "Error sending message!",
        "sending": "Sending...",
        "errors": {
          "accessDenied": "Access denied! You do not have admin privileges.",
          "missingFields": "Missing data or user does not exist.",
          "emailFailed": "System notification created, but an error occurred while sending the email."
        }
      },
      "sortModal": {
        "title": "Choose sorting method",
        "nameAsc": "Name (A-Z)",
        "nameDesc": "Name (Z-A)",
        "favourites": "Favorites",
        "national100": "National 100",
        "distance": "Distance"
      },
      "adminFeedback": {
        "title": "Feedback",
        "filter": "Filter",
        "sortBy": "Sort by",
        "date": "Date",
        "rating": "Rating",
        "type": "Type",
        "order": "Order",
        "newestFirst": "Newest first",
        "oldestFirst": "Oldest first",
        "all": "All",
        "anonymous": "Anonymous",
        "noMessage": "No message",
        "table": {
          "user": "User",
          "type": "Type",
          "message": "Message",
          "rating": "Rating",
          "date": "Date",
          "actions": "Actions"
        },
        "errors": {
          "fetchFailed": "Error fetching feedback data",
          "deleteMultipleFailed": "Error during bulk deletion.",
          "deleteFailed": "Error deleting the record."
        }
      },
      "adminLogs": {
        "title": "System_Logs.txt",
        "newestFirst": "Newest first",
        "oldestFirst": "Oldest first",
        "wipeSelected": "Wipe Selected",
        "noLogs": "No activity logs found in database",
        "table": {
          "userId": "User_ID",
          "status": "Status",
          "eventMessage": "Event_Message",
          "origin": "Origin",
          "timestamp": "Timestamp",
          "action": "Action"
        }
      },
      "adminUsers": {
        "title": "Users",
        "searchPlaceholder": "Search...",
        "sendMessage": "Send message",
        "selectAtLeastOne": "Please select at least one user!",
        "messageSent": "Message sent successfully!",
        "userApproved": "User approved successfully!",
        "userRejected": "User rejected and deleted!",
        "pendingApproval": "Pending approval",
        "approve": "Approve",
        "reject": "Reject",
        "userUpdated": "User updated successfully!",
        "filters": {
          "all": "All",
          "admins": "Admins",
          "regular": "Regular",
          "google": "With Google",
          "noGoogle": "Without Google"
        },
        "sort": {
          "name": "Name",
          "email": "Email"
        },
        "table": {
          "name": "Name",
          "phone": "Phone",
          "email": "Email",
          "google": "Google",
          "admin": "Admin",
          "options": "Options"
        },
        "errors": {
          "fetchFailed": "Error fetching users list.",
          "updateFailed": "An error occurred while updating user data.",
          "actionFailed": "Error attempting to change status.",
          "selectAtLeastOne": "Please select at least one user!"
        }
      },
      "corporateRecon": {
        "title": "Corporate Recon",
        "subtitle": "Enter a company domain to map the corporate structure and internal emails.",
        "searchPlaceholder": "company.com (e.g. stripe.com)",
        "scanning": "Scanning...",
        "analyze": "Analyze",
        "targetMapped": "Target Mapped",
        "linkedinProfile": "LinkedIn Profile",
        "emailPattern": "Email Pattern",
        "extractedFromPublic": "Extracted from public records",
        "noPatternFound": "No clear email pattern found.",
        "sniperTitle": "Sniper (Direct Target)",
        "sniperSubtitle": "Find the email of a specific employee",
        "firstNamePlaceholder": "First Name (e.g. John)",
        "lastNamePlaceholder": "Last Name (e.g. Doe)",
        "searching": "Searching...",
        "extract": "Extract",
        "foundEmail": "Found Email:",
        "confidence": "Confidence",
        "foundEmployees": "Found Employees",
        "anonymousEmployee": "Anonymous Employee",
        "noEmailsFound": "No public emails found for this domain.",
        "errors": {
          "invalidDomain": "Please enter a valid domain (e.g. stripe.com)",
          "serverError": "Error communicating with the server. Check your API key.",
          "missingName": "Please enter First and Last Name.",
          "notFound": "Person not found and the company has no clear generation pattern."
        }
      },
      "forgotPassword": {
        "title": "Restore Access",
        "subtitle": "Set a new secure password for your account to continue working.",
        "newPasswordTitle": "New Password",
        "changingForAccount": "Changing password for account:",
        "newPasswordLabel": "New Password",
        "newPasswordPlaceholder": "Enter new password",
        "confirmPasswordLabel": "Confirm Password",
        "confirmPasswordPlaceholder": "Confirm new password",
        "changePasswordBtn": "Change Password",
        "successMessage": "Password changed successfully! Redirecting to login...",
        "errors": {
          "passwordMismatch": "Passwords do not match!",
          "passwordRequirements": "Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, and a number.",
          "changeError": "Error changing password."
        }
      },
      "githubProfiler": {
        "title": "Deep GitHub Analysis",
        "subtitle": "Use the filters below to find the perfect candidate. The tool will scan their history and build a psychological and technical profile via AI.",
        "searchPlaceholder": "First, Last Name or GitHub Username...",
        "searchBtn": "Search",
        "searchingBtn": "Searching...",
        "filters": {
          "title": "Detailed Filters",
          "location": "City (e.g. London)",
          "allLanguages": "All Languages",
          "followers": "Followers",
          "followersActive": "> 10 (Active)",
          "followersPopular": "> 50 (Popular)",
          "followersLeaders": "> 100 (Leaders)",
          "followersInfluencers": "> 500 (Influencers)",
          "repos": "Repositories",
          "repos10": "> 10 projects",
          "repos30": "> 30 projects",
          "repos50": "> 50 projects",
          "createdAfter": "Reg. after",
          "created2023": "After 2023",
          "created2020": "After 2020",
          "created2015": "After 2015"
        },
        "results": {
          "title": "Found Profiles",
          "total": "Total",
          "githubProfile": "GitHub Profile",
          "analyzeBtn": "Analyze",
          "loadingData": "Extracting OSINT data and AI analysis...",
          "loadingWait": "(This might take up to 30 seconds)"
        },
        "profile": {
          "backBtn": "Back to results",
          "saved": "Saved",
          "saveBtn": "Save Candidate",
          "targetAcquired": "Target Acquired",
          "openGithub": "Open profile of",
          "contactsTitle": "Found Contacts",
          "extractedFromCommits": "Extracted from Commit history:",
          "noPublicEmails": "No public emails found.",
          "securityTitle": "Cross-Check (Security)",
          "cleanBreach": "✅ No data breaches found.",
          "skippedBreach": "ℹ️ HIBP API key is missing. Check skipped.",
          "breachFound": "⚠️ Found {{count}} data breaches!",
          "moreBreaches": "+{{count}} more",
          "aiTitle": "Gemini AI Analysis",
          "aiSubtitle": "Psychological & Technical Profile",
          "role": "Assumed Role:",
          "employerSummary": "💼 Employer Summary",
          "activityEval": "📊 Activity Evaluation",
          "techStack": "Recognized Competencies:",
          "aiEmailGuess": "AI Contact Guess:",
          "aiNotAvailable": "AI Analysis is not available right now.",
          "dailyActivity": "Daily Activity",
          "gistScanner": "Gist Scanner (Secrets & Configs)",
          "potentialLeak": "Potential Data Leak",
          "viewGist": "View",
          "topCollaborators": "Top Collaborators",
          "commonCommits": "shared commits",
          "languages": "Languages Used",
          "scannedRepos": "Recently Scanned Repositories",
          "noDescription": "No description",
          "showingTop10": "*Showing top 10. AI analyzed all.",
          "pdfGeneratedBy": "Report generated automatically by OSI-HR Intelligence Engine",
          "expert": "Expert:",
          "admin": "Administrator",
          "date": "Date:"
        },
        "errors": {
          "noCriteria": "Please enter at least one search criterion.",
          "noUsersFound": "No users found matching these criteria.",
          "searchError": "Search error. Server not responding.",
          "analyzeError": "Error analyzing {{username}}. Check API limits or server.",
          "alreadySaved": "This profile is already saved.",
          "saveError": "Error saving profile.",
          "userNotFoundInGithub": "The user was not found on GitHub.",
          "missingUsername": "Missing username parameter.",
          "missingData": "Profile data is missing."
        }
      },
      "guestPage": {
        "slide1": {
          "title": "OSINT Analysis for Recruitment",
          "description": "Profile IT candidates using public digital footprints and AI analysis to make informed HR decisions."
        },
        "slide2": {
          "title": "Deep GitHub Analysis",
          "description": "Search developers by name. Analyze their repositories, activity, and actual tech stack in seconds."
        },
        "slide3": {
          "title": "Corporate Recon & Headhunting",
          "description": "Investigate competing companies by domain. Uncover their organizational structure and discover key specialists."
        }
      },
      "login": {
        "welcome": "Welcome, {{name}}!",
        "successLogin": "Login successful!",
        "wrongCredentials": "Invalid email or password",
        "notApproved": "Your profile is not yet approved by an administrator.",
        "serverError": "Error connecting to the server",
        "googleError": "Google login error",
        "invalidCode": "Invalid code.",
        "verifyCodeError": "Error verifying code.",
        "enterEmail": "Please enter an email address.",
        "emailNotFound": "Email not found.",
        "codeSent": "Code sent.",
        "sendCodeError": "Error sending code.",
        "leftPanel": {
          "title": "OSINT Intelligence",
          "subtitle": "Continue your research and discover the next top talent."
        },
        "form": {
          "title": "Login",
          "emailLabel": "Email",
          "passwordLabel": "Password",
          "forgotPassword": "Forgot password?",
          "authenticating": "Authenticating...",
          "loginBtn": "Sign in",
          "or": "OR",
          "noAccount": "Don't have an account?",
          "register": "Sign up"
        },
        "modalForgot": {
          "title": "Verification",
          "placeholder": "6-digit code"
        },
        "modal2FA": {
          "title": "Two-Factor Authentication",
          "description": "Open Google Authenticator and enter the 6-digit code or use a Recovery code.",
          "loginBtn": "Log in"
        }
      },
      "notifications": {
        "noNew": "No new notifications.",
        "errors": {
          "fetchFailed": "Error loading notifications",
          "notFound": "Notification not found.",
          "markReadFailed": "Error marking message as read."
        }
      },
      "profile": {
        "userOf": "OSI-HR User",
        "confirmDisable2FA": "Are you sure you want to disable two-factor authentication? Your account will be more vulnerable.",
        "fields": {
          "email": "Email Address",
          "name": "Full Name",
          "phone": "Phone Number",
          "noPhone": "No phone added"
        },
        "security": {
          "title": "Security",
          "twoFactorTitle": "Two-Factor Authentication (2FA)",
          "twoFactorDesc": "Additional protection with Google Authenticator.",
          "disableBtn": "Disable",
          "enableBtn": "Enable"
        },
        "actions": {
          "changePassword": "Change Password",
          "feedback": "Feedback",
          "deleteAccount": "Delete Account"
        },
        "modal2FA": {
          "title": "2FA Setup",
          "step1": "1. Scan the QR code with your Authenticator app",
          "step2Title": "2. SAVE THESE CODES!",
          "step2Desc": "If you lose access to your phone, these codes are the only way to sign in. Each code can only be used once.",
          "step3": "3. Enter the 6-digit code from the app",
          "checking": "Checking...",
          "confirmBtn": "Confirm and Activate"
        },
        "success": {
          "updated": "Updated successfully!",
          "twoFactorEnabled": "2FA successfully enabled!",
          "twoFactorDisabled": "2FA is disabled.",
          "feedbackSent": "Thank you for your feedback!",
          "passwordChanged": "Password changed!"
        },
        "errors": {
          "invalidPhone": "Invalid phone number (min 10 digits).",
          "invalidEmail": "Invalid email address.",
          "nameRequired": "Name is required.",
          "saveError": "Error saving data.",
          "generate2FA": "Error generating 2FA.",
          "invalid6Digit": "Please enter a valid 6-digit code.",
          "invalidCode": "Invalid code.",
          "verifyError": "Verification error.",
          "disable2FA": "Error disabling 2FA.",
          "invalidField": "Invalid field for update.",
        }
      },
      "savedProfiles": {
        "title": "Saved Profiles",
        "subtitle": "Your personal list of analyzed candidates ({{count}})",
        "noProfiles": "You have no saved candidates",
        "noProfilesDesc": "Go to the GitHub Profiler to analyze and save profiles.",
        "deleteProfileTitle": "Delete profile",
        "aiProfile": "AI Profile",
        "foundEmails": "Found Emails",
        "andMore": "and more...",
        "location": "Location",
        "viewDetails": "View details →",
        "errors": {
          "fetchError": "Error loading saved profiles.",
          "deleteConfirm": "Are you sure you want to remove the profile of {{target}}?",
          "deleteError": "An error occurred during deletion.",
          "notFound": "The profile was not found in the database."
        }
      },
      "signup": {
        "codeSentMessage": "Verification email has been sent.",
        "networkError": "Network error: Server not responding!",
        "googleSuccess": "Successful Google registration for {{name}}",
        "leftPanel": {
          "title": "Join us",
          "subtitle": "Create a profile and start analyzing data with the power of OSINT."
        },
        "form": {
          "title": "Create Profile",
          "submitBtn": "Sign Up",
          "alreadyHaveAccount": "Already have an account?"
        },
        "modalVerify": {
          "subtitle": "We sent a code to"
        },
        "modalPending": {
          "title": "Request received",
          "description": "Thank you for registering! Your profile will be reviewed within the next 24 hours. You will receive an email confirmation as soon as an administrator activates your account.",
          "backBtn": "Got it, back to Login"
        },
        "errors": {
          "registrationError": "Error finalizing registration. Please try again later."
        }
      },
      "socialRecon": {
        "title": "Social Media Recon",
        "subtitle": "Cross-Platform Username Enumeration. Enter a username to check their digital footprint across multiple platforms simultaneously.",
        "placeholder": "username (e.g. ggerganov)",
        "scanBtn": "SCAN",
        "scanningBtn": "Scanning...",
        "checkingDatabases": "Checking databases...",
        "resultsFor": "Results for: @{{target}}",
        "toProfile": "To Profile",
        "dorkSearch": "Dork Search",
        "available": "Available / No record",
        "botProtection": "Bot protection (Timeout)",
        "errors": {
          "emptyUsername": "Please enter a username.",
          "scanError": "An error occurred during scanning. The server may be overloaded."
        }
      }
    }
  }
};

i18n
  .use(LanguageDetector) // Разпознава езика на браузъра автоматично
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en', // Ако няма превод на БГ, покажи Английски
    lng: 'bg', // Език по подразбиране в момента
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;