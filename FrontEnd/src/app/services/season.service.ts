import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Season {
  id: number;
  name: string;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeasonService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get all seasons
   */
  getAllSeasons(): Observable<Season[]> {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Season[]>(`${this.apiUrl}/user/season`, { headers });
  }

  /**
   * Get active season
   */
  getActiveSeason(): Observable<Season> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Season>(`${this.apiUrl}/user/season/active`, { headers });
  }

  /**
   * Create new season (Admin only)
   */
  createSeason(seasonData: any): Observable<any> {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/user/season/create`, seasonData, { headers });
  }

  /**
   * Activate a season (Admin only)
   */
  activateSeason(seasonId: number): Observable<any> {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(`${this.apiUrl}/user/season/activate/${seasonId}`, {}, { headers });
  }

  /**
   * Get user qualification for a specific season
   */
  getUsersQualify(seasonId: number): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any[]>(`${this.apiUrl}/user/getUsersQualify/${seasonId}`, { headers });
  }

  /**
   * Get user numbers for a specific season
   */
  getUserNumbers(seasonId: number): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any[]>(`${this.apiUrl}/number/getUserNumbers/${seasonId}`, { headers });
  }

  /**
   * Get statistics for a specific season
   */
  getStatistics(seasonId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any>(`${this.apiUrl}/number/getStadistics/${seasonId}`, { headers });
  }

  /**
   * Get bingo line data for a specific season
   */
  getBingoLine(seasonId: number): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any[]>(`${this.apiUrl}/user/bingoLine/${seasonId}`, { headers });
  }
}
