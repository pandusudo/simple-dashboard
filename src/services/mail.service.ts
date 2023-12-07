import { mailTransporter } from '../configs/mailer';
import * as ejs from 'ejs';
import fs from 'fs';
import path from 'path';

import { Transporter } from 'nodemailer';

export class EmailService {
  private static transporter: Transporter = mailTransporter;

  private constructor() {}

  static sendVerificationEmail(to: string, name: string, token: string): void {
    try {
      const templatePath = path.join(
        __dirname,
        '..',
        'templates',
        'verify-email.ejs'
      );
      const template = fs.readFileSync(templatePath, 'utf-8');
      const compiledTemplate = ejs.compile(template);
      const emailBody = compiledTemplate({
        name,
        verification_link: `${process.env.FE_PATH}/verify-email/${token}`,
      });

      this.sendEmail(to, 'Email verification', emailBody);
    } catch (error) {
      console.error(error);
    }
  }

  static sendEmail(to: string, subject: string, html: string): void {
    try {
      const mailOptions = {
        from: `${process.env.MAILER_NAME} <${process.env.MAILER_EMAIL}>`,
        to,
        subject,
        html,
      };

      this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error(error);
    }
  }
}
