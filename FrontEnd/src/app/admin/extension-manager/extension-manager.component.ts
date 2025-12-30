import { Component, OnInit } from '@angular/core';
import { ExtensionService, ExtensionVersion } from 'src/services/extension/extension.service';

@Component({
    selector: 'app-extension-manager',
    templateUrl: './extension-manager.component.html',
    styleUrls: ['./extension-manager.component.scss']
})
export class ExtensionManagerComponent implements OnInit {
    versions: ExtensionVersion[] = [];
    isLoading = false;
    isUploading = false;

    // Form data
    selectedFile: File | null = null;
    newVersion = '';
    releaseNotes = '';

    // Messages
    successMessage = '';
    errorMessage = '';

    // Drag and drop
    isDragging = false;

    constructor(private extensionService: ExtensionService) { }

    ngOnInit(): void {
        this.loadVersions();
    }

    /**
     * Load all versions from backend
     */
    loadVersions(): void {
        this.isLoading = true;
        this.extensionService.getVersions().subscribe({
            next: (versions) => {
                this.versions = versions;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading versions:', error);
                this.showError('Error al cargar las versiones');
                this.isLoading = false;
            }
        });
    }

    /**
     * Handle file selection from input
     */
    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.validateAndSetFile(file);
        }
    }

    /**
     * Handle drag over event
     */
    onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = true;
    }

    /**
     * Handle drag leave event
     */
    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = false;
    }

    /**
     * Handle file drop
     */
    onFileDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = false;

        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            this.validateAndSetFile(files[0]);
        }
    }

    /**
     * Validate and set the selected file
     */
    validateAndSetFile(file: File): void {
        // Check if it's a ZIP file
        if (!file.name.endsWith('.zip')) {
            this.showError('Solo se permiten archivos .zip');
            return;
        }

        // Check file size (50MB max)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            this.showError('El archivo es demasiado grande. Máximo 50MB');
            return;
        }

        this.selectedFile = file;
        this.clearMessages();
    }

    /**
     * Upload new version
     */
    uploadVersion(): void {
        // Validation
        if (!this.selectedFile) {
            this.showError('Selecciona un archivo ZIP');
            return;
        }

        if (!this.newVersion || !this.newVersion.trim()) {
            this.showError('Ingresa un número de versión');
            return;
        }

        // Validate version format
        const versionRegex = /^\d+\.\d+(\.\d+)?(-[a-zA-Z0-9]+)?$/;
        if (!versionRegex.test(this.newVersion.trim())) {
            this.showError('Formato de versión inválido. Usa: 1.0, 1.0.1, etc.');
            return;
        }

        this.isUploading = true;
        this.clearMessages();

        this.extensionService.uploadVersion(
            this.selectedFile,
            this.newVersion.trim(),
            this.releaseNotes.trim()
        ).subscribe({
            next: (response) => {
                this.showSuccess('Versión subida exitosamente');
                this.resetForm();
                this.loadVersions();
                this.isUploading = false;
            },
            error: (error) => {
                console.error('Error uploading version:', error);
                const errorMsg = error.error?.error || 'Error al subir la versión';
                this.showError(errorMsg);
                this.isUploading = false;
            }
        });
    }

    /**
     * Download a version
     */
    downloadVersion(version: ExtensionVersion): void {
        this.extensionService.downloadVersion(version.id);
    }

    /**
     * Delete a version
     */
    deleteVersion(version: ExtensionVersion): void {
        if (!confirm(`¿Eliminar la versión ${version.version}?`)) {
            return;
        }

        this.extensionService.deleteVersion(version.id).subscribe({
            next: () => {
                this.showSuccess('Versión eliminada exitosamente');
                this.loadVersions();
            },
            error: (error) => {
                console.error('Error deleting version:', error);
                this.showError('Error al eliminar la versión');
            }
        });
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes: number): string {
        return this.extensionService.formatFileSize(bytes);
    }

    /**
     * Format date for display
     */
    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Reset the upload form
     */
    resetForm(): void {
        this.selectedFile = null;
        this.newVersion = '';
        this.releaseNotes = '';

        // Reset file input
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }

    /**
     * Show success message
     */
    showSuccess(message: string): void {
        this.successMessage = message;
        this.errorMessage = '';
        setTimeout(() => {
            this.successMessage = '';
        }, 5000);
    }

    /**
     * Show error message
     */
    showError(message: string): void {
        this.errorMessage = message;
        this.successMessage = '';
    }

    /**
     * Clear all messages
     */
    clearMessages(): void {
        this.successMessage = '';
        this.errorMessage = '';
    }
}
