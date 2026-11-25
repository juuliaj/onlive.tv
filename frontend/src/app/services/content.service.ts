import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ContentItem } from '../models/content.model';

const API_URL = 'http://localhost:8000';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);

  /**
   * Queries published videos from FastAPI /content with optional search and genre filtering.
   * @param searchTerm - Free-text query matched against title, description, and type.
   * @param typeFilter - Optional genre/type filter (e.g., 'Sci-Fi' or 'All').
   * @returns Observable emitting the matching list of ContentItems.
   */
  getCatalog(searchTerm = '', typeFilter = 'All'): Observable<ContentItem[]> {
    let params = new HttpParams();
    if (searchTerm.trim()) {
      params = params.set('search', searchTerm.trim());
    }
    if (typeFilter && typeFilter !== 'All') {
      params = params.set('type', typeFilter);
    }
    return this.http.get<ContentItem[]>(`${API_URL}/content`, { params });
  }

  /**
   * Returns the list of selectable genre filters for the catalog UI.
   * @returns Array of genre strings prefixed with 'All'.
   */
  getAvailableTypes(): string[] {
    return ['All', 'Action', 'Documentary', 'Sci-Fi', 'Thriller', 'Education'];
  }
}