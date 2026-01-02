import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TokenService } from '../token/token.service';

export interface ExtensionVersion {
    id: number;
    version: string;
    filename: string;
    filepath: string;
    file_size: number;
    release_notes: string;
    uploaded_by: number;
    uploaded_by_name?: string;
    created_at: string;
    is_active: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ExtensionService {
    private apiUrl = environment.API_PATH + 'extension';
    private versionSeenSubject = new BehaviorSubject<number | null>(this.getLastSeenVersionId());
    public versionSeen$ = this.versionSeenSubject.asObservable();

    constructor(
        private http: HttpClient,
        private tokenService: TokenService
    ) { }

    /**
     * Upload new extension version (Admin only)
     */
    uploadVersion(file: File, version: string, releaseNotes: string): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('version', version);
        formData.append('release_notes', releaseNotes);

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.tokenService.getToken()}`
        });

        return this.http.post(`${this.apiUrl}/upload`, formData, { headers });
    }

    /**
     * Get all extension versions
     */
    getVersions(): Observable<ExtensionVersion[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.tokenService.getToken()}`
        });

        return this.http.get<ExtensionVersion[]>(`${this.apiUrl}/versions`, { headers });
    }

    /**
     * Get latest extension version
     */
    getLatestVersion(): Observable<ExtensionVersion> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.tokenService.getToken()}`
        });

        return this.http.get<ExtensionVersion>(`${this.apiUrl}/latest`, { headers });
    }

    /**
     * Download extension version
     */
    downloadVersion(id: number): void {
        const token = this.tokenService.getToken();
        const url = `${this.apiUrl}/download/${id}?token=${token}`;

        // Open download in new window
        window.open(url, '_blank');
    }

    /**
     * Get download URL for a version
     */
    getDownloadUrl(id: number): string {
        const token = this.tokenService.getToken();
        return `${this.apiUrl}/download/${id}?token=${token}`;
    }

    /**
     * Delete extension version (Admin only)
     */
    deleteVersion(id: number): Observable<any> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.tokenService.getToken()}`
        });

        return this.http.delete(`${this.apiUrl}/${id}`, { headers });
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Check if there's a new extension version available
     */
    hasNewVersion(latestVersionId: number): boolean {
        const lastSeenVersionId = this.getLastSeenVersionId();
        return !lastSeenVersionId || latestVersionId > lastSeenVersionId;
    }

    /**
     * Mark current version as seen/downloaded
     */
    markVersionAsSeen(versionId: number): void {
        localStorage.setItem('last_seen_extension_version', versionId.toString());
        this.versionSeenSubject.next(versionId);
    }

    /**
     * Get last seen version ID
     */
    private getLastSeenVersionId(): number | null {
        const stored = localStorage.getItem('last_seen_extension_version');
        return stored ? parseInt(stored, 10) : null;
    }
}
