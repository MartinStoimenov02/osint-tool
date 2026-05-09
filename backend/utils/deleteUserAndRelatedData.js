const UserModel = require('../models/user.model.js');
const mongoose = require('mongoose');

const deleteUserAndRelatedData = async (userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deletedUser = await UserModel.findByIdAndDelete(userId).session(session);

    if (!deletedUser) throw new Error("User not found");

    await session.commitTransaction();
    session.endSession();
    return { success: true };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    
    // Тъй като това е util функция, а не middleware, логираме грешката тук
    console.error(`[DELETE USER ERROR] ID: ${userId} -`, err.message);
    return { success: false, error: err.message };
  }
};

module.exports = deleteUserAndRelatedData;