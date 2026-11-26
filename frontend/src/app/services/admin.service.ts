import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminDashboard } from '../models/admin-dashboard.model';

const API_URL = 'http://localhost:8000';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<AdminDashboard> {
    return this.http.get<AdminDashboard>(`${API_URL}/admin/dashboard`);
  }
}
