import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserRole } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-6">
      <div class="w-full max-w-md bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-white mb-2">
            {{ isRegisterMode() ? 'Create Account' : 'System Access' }}
          </h2>
          <p class="text-slate-400 text-sm">
            {{ isRegisterMode() ? 'Register via Primary Node' : 'Authenticate via Primary Node' }}
          </p>
        </div>

        @if (errorMessage()) {
          <div class="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-700 text-red-200 text-sm">
            {{ errorMessage() }}
          </div>
        }

        <form [formGroup]="authForm" (ngSubmit)="onSubmit()" class="space-y-4">
          @if (isRegisterMode()) {
            <div>
              <label for="name" class="block text-sm font-medium text-slate-400 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                formControlName="name"
                placeholder="Jane Doe"
                class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          }

          <div>
            <label for="email" class="block text-sm font-medium text-slate-400 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="user@example.com"
              class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-slate-400 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="••••••••"
              class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          @if (isRegisterMode()) {
            <div>
              <label for="role" class="block text-sm font-medium text-slate-400 mb-1">
                Account Role
              </label>
              <select id="role" formControlName="role" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                <option value="viewer">Viewer (Customer)</option>
                <option value="uploader">Uploader (Creator)</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          } @else {
            <div class="flex items-center justify-between text-sm">
              <label class="flex items-center text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  formControlName="rememberMe"
                  class="mr-2 rounded bg-slate-900 border-slate-600"
                />
                Remember me
              </label>
              <button
                type="button"
                (click)="onForgotPassword()"
                class="text-blue-500 hover:text-blue-400"
              >
                Forgot Password?
              </button>
            </div>
          }

          <button
            type="submit"
            [disabled]="isLoading() || authForm.invalid"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg mt-4 transition-colors"
          >
            @if (isLoading()) {
              {{ isRegisterMode() ? 'Creating account...' : 'Authenticating...' }}
            } @else {
              {{ isRegisterMode() ? 'Register' : 'Login' }}
            }
          </button>
        </form>

        <!-- Toggle Login / Register -->
        <div class="mt-5 text-center text-sm text-slate-400">
          @if (isRegisterMode()) {
            Already have an account?
            <button
              type="button"
              (click)="toggleMode()"
              class="text-blue-500 hover:text-blue-400 font-medium ml-1"
            >
              Login
            </button>
          } @else {
            Don't have an account?
            <button
              type="button"
              (click)="toggleMode()"
              class="text-blue-500 hover:text-blue-400 font-medium ml-1"
            >
              Register
            </button>
          }
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isRegisterMode = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly authForm = this.fb.nonNullable.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    role: ['viewer' as UserRole],
    rememberMe: [true],
  });

  /**
   * Toggles between Login and Register modes and updates name validation accordingly.
   * @returns void
   */
  toggleMode(): void {
    const nextMode = !this.isRegisterMode();
    this.isRegisterMode.set(nextMode);
    this.errorMessage.set(null);

    const nameControl = this.authForm.controls.name;
    if (nextMode) {
      nameControl.setValidators([Validators.required, Validators.minLength(2)]);
    } else {
      nameControl.clearValidators();
    }
    nameControl.updateValueAndValidity();
  }

  /**
   * Submits either a login or registration request and navigates to /catalog on success.
   * @returns void
   */
  onSubmit(): void {
    if (this.authForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { name, email, password, role, rememberMe } = this.authForm.getRawValue();
    const request$ = this.isRegisterMode()
      ? this.authService.register(name, email, password, role)
      : this.authService.login(email, password, rememberMe);

    request$.subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/catalog']);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }

  /**
   * Displays a notice for password recovery.
   * @returns void
   */
  onForgotPassword(): void {
    this.errorMessage.set('Password reset is not available yet. Please contact an administrator.');
  }
}