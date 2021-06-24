import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ name: 'ValidateUsername', async: true })
export class ValidateUsernameRule implements ValidatorConstraintInterface {
  validate(value: any, validationArguments?: ValidationArguments): boolean | Promise<boolean> {
    const chars = /^[0-9a-zA-z]+$/.test(value)
    if (chars) {
      return true
    }
    return false
  }

  defaultMessage?(validationArguments?: ValidationArguments): string {
    return `MSG_5`;
  }
}