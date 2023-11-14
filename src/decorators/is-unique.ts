import {
  ValidationOptions,
  registerDecorator,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

interface IsUniqueOptions {
  getService: () => any; // Callback function to retrieve the service dynamically
  propertyName?: string; // Optional custom property name for columns in the model
}

@ValidatorConstraint({ name: 'isUnique', async: true })
class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private options: IsUniqueOptions) {}

  async validate(value: any, args: ValidationArguments) {
    const propertyName = this.options.propertyName || args.property;
    const service = this.options.getService
      ? this.options.getService()
      : undefined;

    if (!service || !service.findOneBy) {
      return false;
    }

    const existingEntity = await service.findOneBy({ [propertyName]: value });
    return !existingEntity;
  }

  defaultMessage(args: ValidationArguments) {
    const service = this.options.getService
      ? this.options.getService()
      : undefined;

    if (!service || !service.findOneBy) {
      return 'Invalid service provided for IsUnique validation';
    }

    const propertyName = this.options.propertyName || args.property;
    return `Your ${propertyName} is already used. Please use another ${propertyName}!`;
  }
}

export function IsUnique(
  options: IsUniqueOptions,
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: new IsUniqueConstraint(options),
    });
  };
}
