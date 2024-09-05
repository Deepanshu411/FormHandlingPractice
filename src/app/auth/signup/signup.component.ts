import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounce, debounceTime } from 'rxjs';

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
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(8)],
    }),
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
      this.form.controls.password.touched &&
      this.form.controls.password.dirty &&
      this.form.controls.password.invalid
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
    if (this.form.invalid) {
      return
    }
    const enteredEmail = this.form.value.email;
    const enteredPassword = this.form.value.password;
    console.log(enteredEmail, enteredPassword);
    this.form.reset();
  }
}
