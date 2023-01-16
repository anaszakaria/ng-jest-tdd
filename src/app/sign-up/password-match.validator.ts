import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const passwordConfirmation = control.get('passwordConfirmation');
    if (password?.value === passwordConfirmation?.value) {
      return null;
    }
    return {
      passwordMismatch: true
    }
}