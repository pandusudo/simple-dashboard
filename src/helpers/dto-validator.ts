import { plainToClass } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';

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
