import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface User {
    id: number;
    username: string;
    name_surname: string;
    administrator: number;
    profile_image?: string;
    created_at: string;
    totalNumbers: number;
    numberCount: number;
    repeatedCount: number;
}

export interface CreateUserData {
    username: string;
    nameSurname: string;
    password: string;
    admin: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    /**
     * Get all users with statistics (Admin only)
     */
    getAllUsers(): Observable<User[]> {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get<User[]>(`${this.apiUrl}/user/getAllUsers`, { headers });
    }

    /**
     * Create a new user (Admin only)
     */
    createUser(userData: CreateUserData): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
        return this.http.post(`${this.apiUrl}/user/register`, userData, { headers });
    }

    /**
     * Update user (Future implementation - requires backend endpoint)
     */
    updateUser(userId: number, userData: Partial<CreateUserData>): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
        // TODO: Implement when backend endpoint is available
        return this.http.put(`${this.apiUrl}/user/update/${userId}`, userData, { headers });
    }

    /**
     * Delete user (Future implementation - requires backend endpoint)
     */
    deleteUser(userId: number): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        // TODO: Implement when backend endpoint is available
        return this.http.delete(`${this.apiUrl}/user/delete/${userId}`, { headers });
    }
}
