import { googleClient } from '../configs/google';
import { UnauthorizedError } from './errors/UnauthorizedError';

/**
 * The function `verifyGoogleToken` takes a token as input, verifies it using a Google client, and
 * returns the email and name associated with the token.
 * @param {string} token - The `token` parameter is a string that represents the Google token that
 * needs to be verified.
 * @returns an object with two properties: email and name.
 */
export const verifyGoogleToken = async (
  token: string
): Promise<{ email: string; name: string }> => {
  try {
    const google = await googleClient.verifyIdToken({ idToken: token });
    const googleData = google.getPayload();
    const { email, name } = googleData;

    return { email, name };
  } catch (error) {
    throw new UnauthorizedError('Your google token is invalid!');
  }
};
