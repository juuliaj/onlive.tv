export interface DatabaseHealth {
  name: 'users' | 'content' | 'activity';
  status: 'healthy' | 'unavailable';
  checkedAt: string;
  error: string | null;
}

export interface UserMetrics {
  total: number;
  admins: number;
  uploaders: number;
  viewers: number;
}

export interface ContentMetrics {
  total: number;
  published: number;
  processing: number;
  drafts: number;
  archived: number;
  restricted: number;
}

export interface ActivityMetrics {
  playbackEvents: number;
  activeViewers24h: number;
  watchlists: number;
  ratings: number;
  likes: number;
}

export interface AdminDashboard {
  generatedAt: string;
  databases: DatabaseHealth[];
  users: UserMetrics | null;
  content: ContentMetrics | null;
  activity: ActivityMetrics | null;
}
