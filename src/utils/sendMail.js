// Mailgen - generates clean, responsive HTML e-mails for sending transactional mail.
import Mailgen from "mailgen"
import nodemailer from "nodemailer"


const sendMail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: 'Taski',
      link: 'https://mailgen.js/'
    }
  });

  // Generate an HTML email with the provided contents
  const emailHTML = mailGenerator.generate(options.mailGenContent);
  // Generate the plaintext version of the e-mail (for clients that do not support HTML)
  const emailText = mailGenerator.generatePlaintext(options.mailGenContent);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    secure: false, // true for 465, false for other ports. True if sending to Gmail
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD, // To send mail using your Gmail use app passwords & not your original Password
    },
  })


  const mail = {
    from: process.env.MAILTRAP_SENDEREMAIL,
    to: options.email,
    subject: options.subject,
    text: emailText, // plain‑text body
    html: emailHTML, // HTML body
  }

  try {
    await transporter.sendMail(mail)
  } catch (error) {
    console.error("Send Mail Error : ", error)
  }

}

// This function creates a body for by taking username & verificationURL as parameter
export const emailVerificationMailGenContent = (username, verificationURL) => {
  return {
    body: {
      name: username,
      intro: "Welcome to Taski! We're excited to have you on board",
      action: {
        instruction: "To get started with Taski, please click here",
        button: {
          color: "#27ae60",
          text: "Verfiy your email",
          link: verificationURL

        }
      }
    }
  }
}
export const resetPasswordMailGenContent = (username, resetPasswordURL) => {
  return {
    body: {
      name: username,
      intro: "It looks like you requested a password reset for your Taski account. No worries—we've got you covered!",
      action: {
        instruction: "To reset your password, please click here",
        button: {
          color: "#27ae60",
          text: "Reset your Password",
          link: resetPasswordURL

        }
      }
    }
  }
}

// How will the sendMail function work  
/*
sendMail(options)
sendMail({
  email : user.email,
  subject : "Email Verification",
  mailGenContent : emailVerificationMailGenContent(username, verificationURL)
})
sendMail({
  email : user.email,
  subject : "Email Verification",
  mailGenContent : {...}
})

*/
export { sendMail }