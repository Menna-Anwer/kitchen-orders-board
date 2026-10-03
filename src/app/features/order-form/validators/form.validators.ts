import { AbstractControl, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';

export const egyptianMobileValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  if (!value) {
    return null;
  }
  return /^01[0125]\d{8}$/.test(value) ? null : { egyptianMobile: true };
};
export const atLeastOneItemValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const items = control as FormArray;
  return items.length > 0 ? null : { atLeastOneItem: true };
};
