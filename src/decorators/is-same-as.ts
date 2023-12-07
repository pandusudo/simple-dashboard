// src/validators/PasswordValidator.ts
import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class PasswordValidator implements ValidatorConstraintInterface {
  validate(value: string, args: any): boolean {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value === relatedValue;
  }

  defaultMessage(args: any): string {
    const [relatedPropertyName] = args.constraints;
    const key = args.property;
    return `${relatedPropertyName} and ${key} do not match`;
  }
}

export function IsSameAs(
  property: string,
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: PasswordValidator,
    });
  };
}
