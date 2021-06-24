import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ name: 'ValidatePassword', async: true })
export class ValidatePasswordRule implements ValidatorConstraintInterface {
  validate(value: any, validationArguments?: ValidationArguments): boolean | Promise<boolean> {

    const special = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)
    const number = /[0-9]/.test(value)
    const chars = /[a-zA-Z]/.test(value)

    if (special && number && chars) {
      return true
    }
    return false
  }

  defaultMessage?(validationArguments?: ValidationArguments): string {
    return `MSG_4`;
  }
}