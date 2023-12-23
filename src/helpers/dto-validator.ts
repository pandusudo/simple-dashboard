import { plainToClass } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';

/**
 * The function takes a DTO class and data, and returns a
 * promise that resolves to an array of validation errors.
 * @param dtoClass - The `dtoClass` parameter is a constructor function for a Data Transfer Object
 * (DTO) class. It is used to create an instance of the DTO class.
 * @param data - The `data` parameter is an object that contains the data that needs to be validated
 * against the DTO (Data Transfer Object) class. It is a record of key-value pairs, where the keys
 * represent the property names of the DTO class and the values represent the corresponding values to
 * be validated.
 * @returns a Promise that resolves to an array of `ValidationError` objects.
 */
export async function validateDto<T extends object>(
  dtoClass: new () => T,
  data: Record<string, unknown>
): Promise<ValidationError[]> {
  const dtoInstance = plainToClass(dtoClass, data);
  const errors = await validate(dtoInstance, {
    validationError: {
      target: false,
      value: false,
    },
  });

  return errors;
}
