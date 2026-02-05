const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const sendNotification = async (targetToken, title, body, data = {}) => {
  const message = {
    notification: { title, body },
    token: targetToken,
    data: data // Can include chatId or vanishMode status
  };

  try {
    await admin.messaging().send(message);
    console.log("Notification sent successfully");
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

module.exports = { sendNotification };
