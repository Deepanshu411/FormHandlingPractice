import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';

function equalValues(controlName1: string, controlName2: string) {
  return (control: AbstractControl) => {
    const value1 = control.get(controlName1)?.value;
    const value2 = control.get(controlName2)?.value;

    if (value1 === value2) return null
    return { notEqual: true }
  }
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  form = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
    }),
    passwords: new FormGroup({
      password: new FormControl('', {
        validators: [Validators.required, Validators.minLength(8)],
      }),
      confirmPassword: new FormControl('', {
        validators: [Validators.required, Validators.minLength(8)],
      }),
    }, {
      validators: [equalValues('password', 'confirmPassword')],
    }),
    firstName: new FormControl('', { validators: [Validators.required] }),
    lastName: new FormControl('', { validators: [Validators.required] }),
    address: new FormGroup({
      street: new FormControl('', { validators: [Validators.required] }),
      number: new FormControl('', { validators: [Validators.required] }),
      postalCode: new FormControl('', { validators: [Validators.required] }),
      city: new FormControl('', { validators: [Validators.required] }),
    }),
    role: new FormControl<
      'student' | 'teacher' | 'employee' | 'founder' | 'other'
    >('student', {
      validators: [Validators.required],
    }),
    source: new FormArray([
      new FormControl(false),
      new FormControl(false),
      new FormControl(false)
    ]),
    agree: new FormControl(false, { validators: [Validators.required] })
  });

  get isValidEmail() {
    return (
      this.form.controls.email.touched &&
      this.form.controls.email.dirty &&
      this.form.controls.email.invalid
    );
  };

  get isValidPassword() {
    return (
      this.form.controls.passwords.controls.password.touched &&
      this.form.controls.passwords.controls.password.dirty &&
      this.form.controls.passwords.controls.password.invalid
    );
  };

  ngOnInit() {
    const savedItem = window.localStorage.getItem('saved-signup-form')
    
    if (savedItem) {
      const loadedFromData = JSON.parse(savedItem);
      this.form.controls.email.setValue(
        loadedFromData.email
      );
    }

    const subscription = this.form.valueChanges.pipe(debounceTime(500)).subscribe({
      next: (val) => {
        window.localStorage.setItem(
          'saved-signup-form',
          JSON.stringify({ email: val.email })
        );
      },
    });

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  };

  onSubmit() {
    if (this.form.invalid || !this.form.value.agree) {
      console.log('Invalid Form')
      return
    }
    console.log(this.form.value);
    this.form.reset();
    this.form.controls.role.setValue('student')
  }

  onReset() {
    this.form.reset();
  }
}
