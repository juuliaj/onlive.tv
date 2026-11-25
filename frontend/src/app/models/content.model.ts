export type ContentStatus = 'Published' | 'Processing' | 'Archived';

export interface ContentItem {
  contentId: string;       // UUID
  contentOwnerId: string;  // UUID (FK -> User)
  title: string;
  description: string;
  type: string;            // e.g., 'Action', 'Documentary', 'Sci-Fi', 'Thriller', 'Education'
  releaseDate: string;     // ISO date string (YYYY-MM-DD)
  status: ContentStatus;
  storageUrl: string;      // Object storage / MinIO URL
  format: string;          // e.g., 'MP4', 'WebM'
  resolution: string;      // e.g., '1080p', '4K'
  duration: string;        // UI display, e.g., '2h 14m'
  thumbnailUrl: string;    // Poster/thumbnail image
}