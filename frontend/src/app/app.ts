import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    @if (authService.isAuthenticated()) {
      <div class="flex h-screen overflow-hidden bg-slate-900 text-slate-100">
        <!-- Sidebar Navigation (only visible after login) -->
        <aside class="w-64 flex-shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col">
          <div class="p-6 border-b border-slate-800">
            <h1 class="text-xl font-bold text-blue-500">Onlive.tv</h1>
            <p class="text-xs text-slate-500 mt-1">
              {{ authService.currentUser()?.name }} • {{ authService.currentUser()?.role }}
            </p>
          </div>

          <nav class="flex-1 py-4 space-y-1 overflow-y-auto">
            <a
              routerLink="/catalog"
              routerLinkActive="bg-slate-800 border-blue-600 text-white"
              class="w-full flex items-center px-6 py-3 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors border-l-4 border-transparent"
            >
              Video Catalog
            </a>
            @if (authService.currentUser()?.role === 'uploader' || authService.currentUser()?.role === 'admin') {
              <button
               type="button"
                disabled
                class="w-full flex items-center px-6 py-3 text-sm font-medium text-slate-600 cursor-not-allowed border-l-4 border-transparent"
              >
               Upload Portal (Soon)
             </button>
          }
            @if (authService.currentUser()?.role === 'admin') {
              <button
                type="button"
                disabled
                class="w-full flex items-center px-6 py-3 text-sm font-medium text-slate-600 cursor-not-allowed border-l-4 border-transparent"
              >
                Admin Dashboard (Soon)
              </button>
            }
          </nav>

          <div class="p-4 border-t border-slate-800">
            <button
              type="button"
              (click)="onLogout()"
              class="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </aside>

        <!-- Main Content Area -->
        <main class="flex-1 overflow-y-auto bg-slate-900">
          <router-outlet />
        </main>
      </div>
    } @else {
      <!-- Full-screen layout for Login / Register -->
      <router-outlet />
    }
  `,
})
export class App {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /**
   * Logs out the current user and returns to the full-screen login page.
   * @returns void
   */
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}