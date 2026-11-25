import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { AuthResponse, JwtPayload, User, UserRole } from '../models/user.model';

const TOKEN_KEY = 'onlivetv_stream_jwt';
const API_URL = 'http://localhost:8000';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly _currentUser = signal<User | null>(this.restoreUserFromToken());

  /** Read-only signal exposing the currently authenticated user. */
  readonly currentUser = this._currentUser.asReadonly();

  /** Computed signal indicating whether a valid session exists. */
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  /**
   * Authenticates a user against the FastAPI /auth/login endpoint and stores the returned JWT.
   * @param email - User's registered email address.
   * @param password - User's password.
   * @param rememberMe - Persists token in localStorage if true, sessionStorage otherwise.
   * @returns Observable emitting an AuthResponse on success or an Error on failure.
   */
  login(email: string, password: string, rememberMe: boolean): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          this.storeToken(res.accessToken, rememberMe);
          this._currentUser.set(res.user);
        }),
        catchError((err: HttpErrorResponse) =>
          throwError(() => new Error(err.error?.detail ?? 'Login failed. Is the backend running?'))
        )
      );
  }

  /**
   * Registers a new user via FastAPI /auth/register and automatically logs them in.
   * @param name - User's display name.
   * @param email - Unique email address.
   * @param password - User's chosen password.
   * @param role - Account role ('Viewer' or 'Creator').
   * @returns Observable emitting an AuthResponse on success or an Error on failure.
   */
  register(
    name: string,
    email: string,
    password: string,
    role: UserRole = 'Viewer'
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/register`, { name, email, password, role })
      .pipe(
        tap((res) => {
          this.storeToken(res.accessToken, true);
          this._currentUser.set(res.user);
        }),
        catchError((err: HttpErrorResponse) =>
          throwError(() => new Error(err.error?.detail ?? 'Registration failed.'))
        )
      );
  }

  /**
   * Clears the stored JWT from browser storage and resets auth state.
   * @returns void
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    this._currentUser.set(null);
  }

  /**
   * Retrieves the active JWT from localStorage or sessionStorage.
   * @returns The raw JWT string, or null if not present.
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
  }

  private storeToken(token: string, rememberMe: boolean): void {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  }

  private restoreUserFromToken(): User | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload: JwtPayload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp <= Math.floor(Date.now() / 1000)) {
        this.logout();
        return null;
      }
      return {
        userId: payload.sub,
        name: payload.name,
        email: payload.email,
        role: payload.role,
      };
    } catch {
      return null;
    }
  }
}