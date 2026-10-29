const nodemailer = require("nodemailer");
const config = require("../config/config");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: config.GOOGLE_USER_EMAIL,
    clientId: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    refreshToken: config.GOOGLE_REFRESH_TOKEN,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready to send emails");
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: config.GOOGLE_USER_EMAIL, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

async function sendRegistrationEmail(email, name) {
  const subject = "Welcome to Our Bank Ledger!";
  const text = `Hi ${name},\n\nWelcome to our service! We're excited to have you on board.\n\nBest regards,\nThe Team`;
  const html = `<p>Hi ${name},</p><p>Welcome to our service! We're excited to have you on board.</p><p>Best regards,<br>The Team</p>`;
  await sendEmail(email, subject, text, html);
}

async function sendTransactionEmail(email, name, amount, toAccount) {
  const subject = "Transaction Successful | Bank Ledger";
  const text = `Hi ${name},\n\nYour transaction was completed successfully.\n\nTransaction Details:\nAmount: ₹${amount}\nRecipient Account: ${toAccount}\nStatus: Successful\n\nThank you for using Bank Ledger!\n\nBest regards,\nBank Ledger Team`;
  const html = `<h2>Bank Ledger</h2><p>Hi ${name},</p><p>Your transaction was completed successfully.</p><h3>Transaction Details</h3><p><strong>Amount:</strong> ₹${amount}</p><p><strong>Recipient Account:</strong> ${toAccount}</p><p><strong>Status:</strong> Successful</p><p>Thank you for using Bank Ledger!</p><p>Best regards,<br>Bank Ledger Team</p>`;

  await sendEmail(email, subject, text, html);
}

async function sendTransactionFailureEmail(email, name, amount, toAccount) {
  const subject = "Transaction Failed | Bank Ledger";
  const text = `Hi ${name},\n\nUnfortunately, your transaction could not be completed.\nTransaction Details:\nAmount: ₹${amount}\nRecipient Account: ${toAccount}\nStatus: Failed\n\nIf the amount was deducted from your account, please check your transaction history or contact your bank.\n\nBest regards,\nBank Ledger Team`;
  const html = `<h2>Bank Ledger</h2><p>Hi ${name},</p><p>Unfortunately, your transaction could not be completed.</p><h3>Transaction Details</h3><p><strong>Amount:</strong> ₹${amount}</p><p><strong>Recipient Account:</strong> ${toAccount}</p><p><strong>Status:</strong> Failed</p><p>If the amount was deducted from your account, please check your transaction history or contact your bank.</p><p>Best regards,<br>Bank Ledger Team</p>`;

  await sendEmail(email, subject, text, html);
}

module.exports = { sendRegistrationEmail, sendTransactionEmail, sendTransactionFailureEmail };
