import { mailTransporter } from '../config/mailer';
import { Transporter } from 'nodemailer';

export class EmailService {
  private static transporter: Transporter = mailTransporter;

  private constructor() {
    // Private constructor to prevent instantiation
  }

  static sendEmail(to: string, subject: string, text: string): void {
    try {
      const mailOptions = {
        from: `${process.env.MAILER_NAME} <${process.env.MAILER_EMAIL}>`,
        to,
        subject,
        text,
      };

      this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
}
