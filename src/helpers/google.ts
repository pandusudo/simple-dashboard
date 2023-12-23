import { googleClient } from '../configs/google';
import { UnauthorizedError } from './errors/UnauthorizedError';

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
