const cron = require('node-cron');
const dayjs = require('dayjs'); // Използваме dayjs за консистентност и желязна точност
const UserNotificationModel = require('../models/userNotification.model.js');
const logError = require('../utils/logger.js'); // Добавяме липсващия импорт

// Джоб, който се изпълнява всеки ден в 02:00
cron.schedule('0 2 * * *', async () => {
  // cron.schedule('* * * * *', async () => { // За локални тестове
  try {
      console.log('[CRON] Стартиране на проверка за прочетени нотификации...');
    // Вземаме датата точно преди 1 месец и я клонираме чисто
    const targetDate = dayjs().subtract(1, 'month');
    
    // Задаваме граници за точния ден (00:00:00 до 23:59:59)
    const startOfDay = targetDate.startOf('day').toDate();
    const endOfDay = targetDate.endOf('day').toDate();

    const result = await UserNotificationModel.deleteMany({
      readOn: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    console.log(`[CRON] Успешно изтрити ${result.deletedCount} прочетени известия от ${targetDate.format('YYYY-MM-DD')}`);
  } catch (err) {
    logError(err, null, { className: 'deleteUserNotifications.job', functionName: 'cron.schedule' });
    console.error('[CRON ERROR] Грешка при изтриване на стари известия:', err);
  }
});