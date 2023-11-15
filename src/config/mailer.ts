import nodemailer from 'nodemailer';

const auth: any = {};

if (process.env.MAILER_USERNAME && process.env.MAILER_USERNAME !== '') {
  auth['user'] = process.env.MAILER_USERNAME;
}

if (process.env.MAILER_PASSWORD && process.env.MAILER_PASSWORD !== '') {
  auth['password'] = process.env.MAILER_PASSWORD;
}

const smtpConfig = {
  host: process.env.MAILER_SERVER,
  port: Number(process.env.MAILER_PORT),
  secure: process.env.MAILER_TLS == 'true',
  auth,
};

export const mailTransporter = nodemailer.createTransport(smtpConfig);
