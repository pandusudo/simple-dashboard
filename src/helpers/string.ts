/**
 * The function generates a random string of a specified length using a combination of uppercase
 * letters, lowercase letters, and numbers.
 * @param {number} [length=16] - The `length` parameter is an optional parameter that specifies the
 * length of the random string to be generated. If no value is provided for `length`, it defaults to
 * 16.
 * @returns a randomly generated string of the specified length.
 */
export function generateRandomString(length: number = 16): string {
  const characters: string =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString: string = '';

  for (let i = 0; i < length; i++) {
    const randomIndex: number = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}

/**
 * The function checks if a given string is a valid JSON string.
 * @param {string} str - The parameter `str` is a string that represents a JSON object.
 * @returns The function isJsonString returns a boolean value. It returns true if the input string can
 * be parsed as a valid JSON, and false if it cannot be parsed.
 */
export function isJsonString(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
}
