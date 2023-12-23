import { mailTransporter } from '../configs/mailer';
import * as ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import { Transporter } from 'nodemailer';
import { throwError } from '../helpers/error-thrower';

export class EmailService {
  // Descriptive name for the service
  private static serviceName: string = 'Mail';
  private static transporter: Transporter = mailTransporter;

  private constructor() {}

  /**
   * The function sends a verification email to a specified recipient with a generated token and a link
   * to verify the email.
   * @param {string} to - The "to" parameter is the email address of the recipient to whom the
   * verification email will be sent.
   * @param {string} name - The name parameter is a string that represents the name of the recipient of
   * the email.
   * @param {string} token - The `token` parameter is a string that represents a unique verification
   * token. It is typically generated when a user signs up or requests to verify their email address.
   * The token is used to verify the user's email address by including it in a verification link that
   * is sent to the user's email.
   */
  static sendVerificationEmail(to: string, name: string, token: string): void {
    try {
      const templatePath = path.join(
        __dirname,
        '../..',
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
      throwError(error, this.serviceName);
    }
  }

  /**
   * The function `sendEmail` sends an email with the specified recipient, subject, and HTML content.
   * @param {string} to - The "to" parameter is the email address of the recipient. It specifies the
   * email address to which the email will be sent.
   * @param {string} subject - The subject parameter is a string that represents the subject of the
   * email. It is the title or brief description of the email content.
   * @param {string} html - The `html` parameter is a string that represents the HTML content of the
   * email. It can include any valid HTML markup, such as text, images, links, tables, etc. This
   * content will be displayed in the body of the email when it is received by the recipient.
   */
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
      throwError(error, this.serviceName);
    }
  }
}
