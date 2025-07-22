const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

const sendSMS = async (message, to) => {
  try {
    const res = await client.messages.create({
      body: message,
      from: twilioNumber,
      to: to
    });
    return res;
  } catch (err) {
    console.error('SMS sending failed:', err.message);
    throw err;
  }
};

module.exports = sendSMS; 