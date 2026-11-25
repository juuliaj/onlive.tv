import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ContentItem } from '../../models/content.model';
import { AuthService } from '../../services/auth.service';
import { ContentService } from '../../services/content.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <header class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 class="text-3xl font-bold text-white">Content Library</h2>
            <p class="text-slate-400 mt-1">Read Replica Query Results</p>
          </div>

          <div class="flex items-center space-x-4">
            <!-- Search Input -->
            <div class="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 flex items-center focus-within:border-blue-500">
              <input
                type="text"
                [ngModel]="searchTerm()"
                (ngModelChange)="onSearchChange($event)"
                placeholder="Search catalog..."
                class="bg-transparent border-none focus:outline-none text-sm text-white w-48"
              />
            </div>

            <!-- User Avatar + Logout -->
            <div class="flex items-center space-x-3">
              <div
                [title]="currentUser()?.name + ' (' + currentUser()?.role + ')'"
                class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white select-none"
              >
                {{ userInitials() }}
              </div>
              <button
                type="button"
                (click)="onLogout()"
                class="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-lg text-slate-300 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <!-- Genre Filter Bar -->
        <div class="flex flex-wrap gap-2 mb-8">
          @for (type of availableTypes; track type) {
            <button
              type="button"
              (click)="onTypeSelect(type)"
              [class]="
                selectedType() === type
                  ? 'px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white'
                  : 'px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              "
            >
              {{ type }}
            </button>
          }
        </div>

        <!-- Catalog Grid -->
        @if (isLoading()) {
          <p class="text-slate-400 text-sm">Querying Read Replica...</p>
        } @else if (videos().length === 0) {
          <div class="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center text-slate-400">
            No videos found matching "{{ searchTerm() }}".
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            @for (video of videos(); track video.contentId) {
              <div
                (click)="onSelectVideo(video)"
                class="group cursor-pointer bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500 transition-colors"
              >
                <div class="relative aspect-video bg-slate-900">
                  <img
                    [src]="video.thumbnailUrl"
                    [alt]="video.title"
                    class="w-full h-full object-cover"
                  />
                  <div class="absolute top-2 left-2 bg-slate-900/90 px-2 py-0.5 rounded text-[10px] font-medium text-blue-400 border border-slate-700">
                    {{ video.resolution }}
                  </div>
                  <div class="absolute bottom-2 right-2 bg-slate-900/90 px-2 py-1 rounded text-xs border border-slate-700">
                    {{ video.duration }}
                  </div>
                </div>
                <div class="p-4">
                  <h4 class="font-semibold text-slate-100 group-hover:text-blue-400 transition-colors truncate">
                    {{ video.title }}
                  </h4>
                  <p class="text-xs text-slate-400 mt-1">
                    {{ video.type }} • {{ video.releaseDate.slice(0, 4) }}
                  </p>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class CatalogComponent implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;
  readonly videos = signal<ContentItem[]>([]);
  readonly searchTerm = signal('');
  readonly selectedType = signal('All');
  readonly isLoading = signal(true);
  readonly availableTypes = this.contentService.getAvailableTypes();

  /** Derives 1-2 character initials from the authenticated user's name. */
  readonly userInitials = computed(() => {
    const name = this.currentUser()?.name ?? 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  });

  ngOnInit(): void {
    this.loadCatalog();
  }

  /**
   * Fetches filtered video content from ContentService.
   * @returns void
   */
  loadCatalog(): void {
    this.isLoading.set(true);
    this.contentService.getCatalog(this.searchTerm(), this.selectedType()).subscribe((items) => {
      this.videos.set(items);
      this.isLoading.set(false);
    });
  }

  /**
   * Updates the search query and refreshes catalog results.
   * @param value - Current text in the search box.
   */
  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.loadCatalog();
  }

  /**
   * Updates the active genre filter and refreshes catalog results.
   * @param type - Selected genre or 'All'.
   */
  onTypeSelect(type: string): void {
    this.selectedType.set(type);
    this.loadCatalog();
  }

  /**
   * Handles video card clicks. Ready to route to the Video Player page once implemented.
   * @param video - The selected ContentItem.
   */
  onSelectVideo(video: ContentItem): void {
    // Future route: this.router.navigate(['/player', video.contentId]);
    console.log('Selected video for playback:', video);
    alert(`Opening "${video.title}" (${video.resolution} ${video.format})\nVideo Player route not wired yet.`);
  }

  /**
   * Logs out the current user and redirects to the login screen.
   * @returns void
   */
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}