/**
 * The function takes an object and an array of keys, and returns a new object
 * that excludes the specified keys.
 * @param {T} obj - The `obj` parameter is an object of type `T`, which represents the input object
 * from which we want to exclude certain keys.
 * @param {K[]} keys - An array of keys that should be excluded from the object.
 * @returns The `exclude` function returns a new object that excludes the specified keys from the
 * original object. The returned object has the same type as the original object, but without the
 * specified keys.
 */
export function exclude<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key as K))
  ) as Omit<T, K>;
}
