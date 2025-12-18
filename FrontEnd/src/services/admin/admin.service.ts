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
     * Get admin token from localStorage
     */
    private getAdminToken(): string {
        return localStorage.getItem('adminToken') || '';
    }

    /**
     * Get HTTP headers with admin token
     */
    private getHeaders(): HttpHeaders {
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAdminToken()}`
        });
    }

    /**
     * Get filtered numbers
     */
    getNumbers(filters: any = {}): Observable<any> {
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
