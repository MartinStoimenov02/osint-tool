const cron = require('node-cron');
const dayjs = require('dayjs');
const UserModel = require('../models/user.model.js');
const deleteUserAndRelatedData = require('../utils/deleteUserAndRelatedData.js');
const { sendEmail } = require('../utils/email.js');
const logError = require('../utils/logger.js'); // Добавен липсващ импорт

cron.schedule('0 2 * * *', async () => {
// cron.schedule('* * * * *', async () => { // За локални тестове
  console.log('[CRON] Стартиране на проверка за неактивни потребители...');
  try {
    const users = await UserModel.find();

    const now = dayjs().startOf('day');

    for (const user of users) {
      const lastLogin = user.lastLogin || user.createdAt;
      const lastLoginDate = dayjs(lastLogin).startOf('day');
      const monthsInactive = now.diff(lastLoginDate, 'month');
      const daysInactive = now.diff(lastLoginDate, 'day');
      const daysUntilDeletion = 365 - daysInactive;

      // Предупредителни имейли на 6, 10 и 11 месеца
      if ([6, 10, 11].includes(monthsInactive)) {
        try {
          await sendEmail(
              user.email,
              "Warning: Inactivity in your OSI-HR account",
              `<p>Hello ${user.name || 'user'},</p>
              <p>You haven't logged into your OSI-HR account for ${monthsInactive} months.</p>
              <p>If you do not use your account by the time you reach 12 months of inactivity, your profile will be automatically deleted and <b>cannot be restored</b>!</p>`
          );
          console.log(`[EMAIL] Изпратено предупреждение до ${user.email} (${monthsInactive} месеца неактивност)`);
        } catch (err) {
          logError(err, null, { className: 'cleanupInactiveUsers.job', functionName: 'cron.schedule' });
          console.error(`[EMAIL ERROR] Неуспешно изпращане до ${user.email}:`, err);
        }
      }

      // Последна седмица - ежедневно напомняне
      if (monthsInactive >= 11 && daysUntilDeletion <= 7 && daysUntilDeletion > 0) {
        try {
          await sendEmail(
              user.email,
              `Important: Your OSI-HR account will be deleted in ${daysUntilDeletion} days`,
              `<p>Hello,</p>
              <p>Your OSI-HR account has been inactive for almost a year.</p>
              <p>In <b>${daysUntilDeletion}</b> days, it will be <b>automatically deleted</b> if you do not log in again. This operation <b>cannot be undone or restored</b>!</p>`
          );
          console.log(`[EMAIL] Изпратено ежедневно напомняне до ${user.email} (${daysUntilDeletion} дни остават)`);
        } catch (err) {
          logError(err, null, { className: 'cleanupInactiveUsers.job', functionName: 'cron.schedule' });
          console.error(`[EMAIL ERROR] Неуспешно изпращане до ${user.email}:`, err);
        }
      }

      // Изтриване след 12 месеца (365 дни)
      if (daysInactive >= 365) {
        try {
          const result = await deleteUserAndRelatedData(user._id);
          if (result.success) {
            console.log(`[CRON] Успешно изтрит потребител: ${user.email}`);

            // Имейл след изтриване
            try {
              await sendEmail(
                  user.email,
                  "Your OSI-HR profile has been deleted",
                  `<p>Hello,</p>
                  <p>Your OSI-HR profile was automatically deleted due to 12 months of inactivity.</p>
                  <p>It cannot be restored.</p>`
              );
              console.log(`[EMAIL] Изпратен финален имейл до ${user.email}`);
            } catch (err) {
              logError(err, null, { className: 'cleanupInactiveUsers.job', functionName: 'cron.schedule' });
              console.error(`[EMAIL ERROR] Неуспешно изпращане на финален имейл до ${user.email}:`, err);
            }
          } else {
            console.log(`[CRON] Грешка при изтриване на ${user.email}: ${result.error}`);
          }
        } catch (err) {
          logError(err, null, { className: 'cleanupInactiveUsers.job', functionName: 'cron.schedule' });
          console.error(`[CRON ERROR] Грешка при обработка на ${user.email}:`, err);
        }
      }
    }
  } catch (err) {
    logError(err, null, { className: 'cleanupInactiveUsers.job', functionName: 'cron.schedule' });
    console.error('[CRON ERROR] Грешка при обща проверка за неактивност:', err);
  }
});