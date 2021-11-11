/* eslint-disable no-console */
const path = require("path");
const nodemailer = require("nodemailer");

const envPath = path.join(__dirname, "../../.env");
require("dotenv").config({ path: envPath });
console.log(process.env.EMAIL_HOST);

class EmailService {
  constructor(user) {
    this.to = user.email;
    this.displayName = user.name;
    this.from = process.env.EMAIL_FROM;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: template,
    };
    await this.newTransport().sendMail(mailOptions, (err, response) => {
      if (err) {
        console.log(err);
      }
      console.log(response);
    });
  }

  async forgetPassword(verifyCode) {
    const template = `
    <p>Bạn vừa gửi yêu cầu Quên mật khẩu. </p>
    <p>Vui lòng click vào link bên dưới để đổi mật khẩu (link có hiệu lực trong vòng <strong>10 phút </strong>). Nếu không phải là bạn, xin vui lòng bỏ qua email này.</p>
    <p><a href='${process.env.FE_HOST}/user/reset-password?token=${encodeURIComponent(verifyCode)}' target='_blank'> CLICK VÀO ĐÂY</a> để đổi mật khẩu.</p>
    `
    await this.send(template, '[QUIZ] - Quên mật khẩu')
  }
}

module.exports = EmailService;
