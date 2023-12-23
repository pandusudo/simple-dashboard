import { google } from 'googleapis';

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
export const googleClient = new google.auth.OAuth2(clientId, clientSecret);
