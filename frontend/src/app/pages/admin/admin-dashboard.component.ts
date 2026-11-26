import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, finalize, merge, switchMap, timer } from 'rxjs';
import { AdminDashboard, DatabaseHealth } from '../../models/admin-dashboard.model';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  template: `
    <div class="min-h-full bg-slate-900 p-5 text-slate-100 sm:p-8">
      <div class="mx-auto max-w-7xl">
        <header class="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              Platform operations
            </p>
            <h1 class="text-3xl font-bold tracking-tight text-white">Admin dashboard</h1>
            <p class="mt-2 text-sm text-slate-400">
              Live health and activity across your distributed services.
            </p>
          </div>
          <div class="flex items-center gap-3">
            @if (dashboard(); as data) {
              <span class="text-xs text-slate-500">
                Updated {{ data.generatedAt | date: 'shortTime' }}
              </span>
            }
            <button
              type="button"
              (click)="refresh()"
              [disabled]="isLoading()"
              class="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-blue-500 hover:text-white disabled:cursor-wait disabled:opacity-60"
            >
              {{ isLoading() ? 'Refreshing…' : 'Refresh now' }}
            </button>
          </div>
        </header>

        @if (loadError()) {
          <div
            role="alert"
            class="mb-6 rounded-xl border border-rose-900/70 bg-rose-950/40 px-4 py-3 text-sm text-rose-200"
          >
            {{ loadError() }}
            @if (dashboard()) {
              <span class="text-rose-300/70"> Showing the last successful snapshot.</span>
            }
          </div>
        }

        <section aria-labelledby="database-health-heading" class="mb-8">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h2 id="database-health-heading" class="text-lg font-semibold text-white">
                Database health
              </h2>
              <p class="mt-1 text-xs text-slate-500">Connection and query checks · refreshes every 30 seconds</p>
            </div>
            <span class="text-xs text-slate-500">3 services</span>
          </div>
          <div class="grid gap-4 md:grid-cols-3">
            @for (name of databaseNames; track name) {
              <article class="rounded-xl border border-slate-800 bg-slate-800/70 p-5 shadow-lg shadow-black/10">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-sm font-semibold capitalize text-slate-100">db-{{ name }}</p>
                    <p class="mt-1 text-xs text-slate-500">{{ databasePurpose(name) }}</p>
                  </div>
                  @if (databaseHealth(name); as health) {
                    <span
                      class="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium"
                      [class]="health.status === 'healthy'
                        ? 'bg-emerald-500/10 text-emerald-300'
                        : 'bg-rose-500/10 text-rose-300'"
                    >
                      <span
                        class="h-1.5 w-1.5 rounded-full"
                        [class]="health.status === 'healthy' ? 'bg-emerald-400' : 'bg-rose-400'"
                      ></span>
                      {{ health.status === 'healthy' ? 'Operational' : 'Unavailable' }}
                    </span>
                  } @else {
                    <span class="rounded-full bg-slate-700/70 px-2.5 py-1 text-xs text-slate-400">
                      {{ isLoading() ? 'Checking…' : 'No data' }}
                    </span>
                  }
                </div>
                @if (databaseHealth(name)?.error; as error) {
                  <p class="mt-4 border-t border-slate-800 pt-3 text-xs text-rose-300">{{ error }}</p>
                } @else if (databaseHealth(name); as health) {
                  <p class="mt-4 border-t border-slate-800 pt-3 text-xs text-slate-500">
                    Last checked {{ health.checkedAt | date: 'shortTime' }}
                  </p>
                }
              </article>
            }
          </div>
        </section>

        <section aria-labelledby="overview-heading" class="mb-8">
          <div class="mb-4">
            <h2 id="overview-heading" class="text-lg font-semibold text-white">Platform overview</h2>
            <p class="mt-1 text-xs text-slate-500">Aggregated from the users, content, and activity databases</p>
          </div>
          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article class="rounded-xl border border-slate-800 bg-slate-850 p-5">
              <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Registered users</p>
              <p class="mt-3 text-3xl font-bold text-white">
                {{ dashboard()?.users?.total === undefined ? '—' : (dashboard()?.users?.total | number) }}
              </p>
              <p class="mt-2 text-xs text-slate-500">
                {{ dashboard()?.users?.viewers ?? '—' }} viewers ·
                {{ dashboard()?.users?.uploaders ?? '—' }} uploaders ·
                {{ dashboard()?.users?.admins ?? '—' }} admins
              </p>
            </article>
            <article class="rounded-xl border border-slate-800 bg-slate-850 p-5">
              <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Content library</p>
              <p class="mt-3 text-3xl font-bold text-white">
                {{ dashboard()?.content?.total === undefined ? '—' : (dashboard()?.content?.total | number) }}
              </p>
              <p class="mt-2 text-xs text-slate-500">
                {{ dashboard()?.content?.published ?? '—' }} published ·
                {{ dashboard()?.content?.processing ?? '—' }} processing
              </p>
            </article>
            <article class="rounded-xl border border-slate-800 bg-slate-850 p-5">
              <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Playback events</p>
              <p class="mt-3 text-3xl font-bold text-white">
                {{ dashboard()?.activity?.playbackEvents === undefined ? '—' : (dashboard()?.activity?.playbackEvents | number) }}
              </p>
              <p class="mt-2 text-xs text-slate-500">
                {{ dashboard()?.activity?.activeViewers24h ?? '—' }} active viewers in the last 24 hours
              </p>
            </article>
            <article class="rounded-xl border border-slate-800 bg-slate-850 p-5">
              <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Community activity</p>
              <p class="mt-3 text-3xl font-bold text-white">
                {{ dashboard()?.activity?.likes === undefined ? '—' : (dashboard()?.activity?.likes | number) }}
              </p>
              <p class="mt-2 text-xs text-slate-500">
                likes · {{ dashboard()?.activity?.ratings ?? '—' }} ratings ·
                {{ dashboard()?.activity?.watchlists ?? '—' }} watchlists
              </p>
            </article>
          </div>
        </section>

        <section aria-labelledby="breakdown-heading" class="grid gap-4 lg:grid-cols-2">
          <article class="rounded-xl border border-slate-800 bg-slate-850 p-5">
            <h2 id="breakdown-heading" class="text-sm font-semibold text-white">Content by status</h2>
            <div class="mt-5 space-y-4">
              @for (status of contentStatuses; track status.label) {
                <div>
                  <div class="mb-1.5 flex justify-between text-xs">
                    <span class="capitalize text-slate-400">{{ status.label }}</span>
                    <span class="font-medium text-slate-200">
                      {{ status.value() === undefined ? '—' : (status.value() | number) }}
                    </span>
                  </div>
                  <div class="h-1.5 overflow-hidden rounded-full bg-slate-700">
                    <div
                      class="h-full rounded-full bg-blue-500 transition-all"
                      [style.width.%]="contentBarWidth(status.value())"
                    ></div>
                  </div>
                </div>
              }
            </div>
          </article>
          <article class="rounded-xl border border-slate-800 bg-slate-800/70 p-5">
            <h2 class="text-sm font-semibold text-white">Activity database</h2>
            <p class="mt-1 text-xs text-slate-500">Engagement totals from recorded platform activity</p>
            <div class="mt-5 grid grid-cols-2 gap-3">
              @for (metric of activityBreakdown; track metric.label) {
                <div class="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                  <p class="text-xs text-slate-500">{{ metric.label }}</p>
                  <p class="mt-1 text-lg font-semibold text-slate-100">
                    {{ metric.value() === undefined ? '—' : (metric.value() | number) }}
                  </p>
                </div>
              }
            </div>
          </article>
        </section>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly refreshRequests = new Subject<void>();

  readonly dashboard = signal<AdminDashboard | null>(null);
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly databaseNames = ['users', 'content', 'activity'] as const;
  readonly contentStatuses = [
    { label: 'Published', value: () => this.dashboard()?.content?.published },
    { label: 'Processing', value: () => this.dashboard()?.content?.processing },
    { label: 'Drafts', value: () => this.dashboard()?.content?.drafts },
    { label: 'Archived', value: () => this.dashboard()?.content?.archived },
    { label: 'Restricted', value: () => this.dashboard()?.content?.restricted },
  ];
  readonly activityBreakdown = [
    { label: 'Playback events', value: () => this.dashboard()?.activity?.playbackEvents },
    { label: 'Active viewers · 24h', value: () => this.dashboard()?.activity?.activeViewers24h },
    { label: 'Watchlists', value: () => this.dashboard()?.activity?.watchlists },
    { label: 'Ratings', value: () => this.dashboard()?.activity?.ratings },
  ];

  ngOnInit(): void {
    merge(timer(0, 30_000), this.refreshRequests)
      .pipe(
        switchMap(() => {
          this.isLoading.set(true);
          this.loadError.set(null);
          return this.adminService.getDashboard().pipe(
            catchError((error: HttpErrorResponse) => {
              this.loadError.set(
                error.error?.detail ?? 'Could not load dashboard data. Check your connection and try again.'
              );
              return EMPTY;
            }),
            finalize(() => this.isLoading.set(false))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((data) => this.dashboard.set(data));
  }

  refresh(): void {
    this.refreshRequests.next();
  }

  databaseHealth(name: DatabaseHealth['name']): DatabaseHealth | undefined {
    return this.dashboard()?.databases.find((database) => database.name === name);
  }

  databasePurpose(name: DatabaseHealth['name']): string {
    return {
      users: 'Accounts and roles',
      content: 'Video catalog',
      activity: 'Playback and engagement',
    }[name];
  }

  contentBarWidth(value: number | undefined): number {
    const total = this.dashboard()?.content?.total ?? 0;
    return total > 0 && value !== undefined ? (value / total) * 100 : 0;
  }
}
