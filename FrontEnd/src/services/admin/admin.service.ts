import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AdminService {

    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    /**
     * Get token from localStorage (regular token, not adminToken)
     */
    private getToken(): string {
        return localStorage.getItem('token') || '';
    }

    /**
     * Get HTTP headers with token
     */
    private getHeaders(): HttpHeaders {
        const token = this.getToken();
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'x-access-token': token,
            'Authorization': `Bearer ${token}`
        });
    }

    /**
     * Get filtered numbers with pagination
     */
    getNumbers(filters: any = {}, page: number = 1, limit: number = 50): Observable<any> {
        let params = new HttpParams();

        if (filters.seasonId) {
            params = params.set('seasonId', filters.seasonId);
        }
        if (filters.userId) {
            params = params.set('userId', filters.userId);
        }
        if (filters.startDate) {
            params = params.set('startDate', filters.startDate);
        }
        if (filters.endDate) {
            params = params.set('endDate', filters.endDate);
        }
        if (filters.number) {
            params = params.set('number', filters.number);
        }

        // Add pagination params
        params = params.set('page', page.toString());
        params = params.set('limit', limit.toString());

        return this.http.get(`${this.apiUrl}/admin/numbers`, {
            headers: this.getHeaders(),
            params: params
        });
    }

    /**
     * Add a new number
     */
    addNumber(userId: number, seasonId: number, number: number, date: string): Observable<any> {
        const body = {
            userId,
            seasonId,
            number,
            date
        };

        return this.http.post(`${this.apiUrl}/admin/numbers/add`, body, {
            headers: this.getHeaders()
        });
    }

    /**
     * Edit an existing number
     */
    editNumber(id: number, updates: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/admin/numbers/edit/${id}`, updates, {
            headers: this.getHeaders()
        });
    }

    /**
     * Delete a number
     */
    deleteNumber(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/admin/numbers/delete/${id}`, {
            headers: this.getHeaders()
        });
    }

    /**
     * Get all users (admin token)
     */
    getUsers(): Observable<any> {
        return this.http.get(`${this.apiUrl}/user/getAllUsers`, {
            headers: this.getHeaders()
        });
    }

    /**
     * Get all seasons (admin token)
     */
    getSeasons(): Observable<any> {
        return this.http.get(`${this.apiUrl}/user/season`, {
            headers: this.getHeaders()
        });
    }
}
