import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

export class MailerService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.mail.host,
      port: env.mail.port,
      auth: {
        user: env.mail.user,
        pass: env.mail.pass,
      },
    });
    this.from = env.mail.from;
  }

  async send(to, subject, text) {
    await this.transporter.sendMail({ from: this.from, to, subject, text });
  }
}
