const db = require("../models");
const User = db.user;
const Notification = db.notification;

// API for storing or updating FCM tokens
exports.saveToken = async (req, res) => {
    try {
      const { email, token } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
          return res.status(400).json({ message: 'Invalid user' });
      }
 
      // Find the existing notification record for the given email
      let notification = await Notification.findOne({ email });
  
      if (!notification) {
        // If no record exists, create a new one
        notification = new Notification({ email, token });
      } else {
        // If a record exists, update the token
        notification.token = token;
      }
  
      // Save the notification record
      await notification.save();
  
      res.status(200).json({ message: 'Token stored or updated successfully' });
    } catch (error) {
      console.error('Error storing or updating token:', error.message);
      res.status(500).json({ message: `Error storing or updating token: ${error.message}` });
    }
  };
  
// API for delete FCM tokens on logout
exports.removeToken = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: 'Invalid user' });
    }

    await Notification.deleteOne({ email });

    res.status(200).json({ message: 'Token deleted' });
  } catch (error) {
    console.error('Error deleting token:', error.message);
    res.status(500).json({ message: `Error deleting token: ${error.message}` });
  }
};
