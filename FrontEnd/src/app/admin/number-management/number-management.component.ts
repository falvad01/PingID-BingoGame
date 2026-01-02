import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/services/admin/admin.service';
import { TokenService } from 'src/services/token/token.service';

interface Number {
    id: number;
    number: number;
    created_at: string;
    is_extension: boolean;
    User: {
        id: number;
        username: string;
        name_surname: string;
    };
    Season: {
        id: number;
        name: string;
    };
}

interface User {
    id: number;
    username: string;
    name_surname: string;
}

interface Season {
    id: number;
    name: string;
    is_active: boolean;
}

@Component({
    selector: 'app-number-management',
    templateUrl: './number-management.component.html',
    styleUrls: ['./number-management.component.scss']
})
export class NumberManagementComponent implements OnInit {

    numbers: Number[] = [];
    filteredNumbers: Number[] = [];
    users: User[] = [];
    seasons: Season[] = [];

    // Filters
    selectedSeasonId: number | null = null;
    selectedUserId: number | null = null;
    selectedNumber: number | null = null;
    startDate: string = '';
    endDate: string = '';

    // Pagination
    currentPage: number = 1;
    totalPages: number = 1;
    totalNumbers: number = 0;
    pageSize: number = 50;

    // Add form
    showAddForm: boolean = false;
    newNumber = {
        userId: null as number | null,
        seasonId: null as number | null,
        number: null as number | null,
        date: new Date().toISOString().split('T')[0]
    };

    // Edit mode
    editingId: number | null = null;
    editForm = {
        number: null as number | null,
        date: ''
    };

    // Loading and messages
    loading: boolean = false;
    message: string = '';
    messageType: 'success' | 'error' = 'success';

    // Expose Math to template
    Math = Math;

    constructor(
        private adminService: AdminService,
        private tokenService: TokenService
    ) { }

    ngOnInit(): void {
        // Check if user is logged in and is admin
        if (this.tokenService.isLogged() && this.tokenService.isAdmin()) {
            this.loadData();
        } else {
            console.error('No admin access. Please login as admin first.');
            this.showMessage('Por favor inicia sesión como administrador', 'error');
        }
    }

    loadData(): void {
        this.loadNumbers();
        this.loadUsers();
        this.loadSeasons();
    }

    loadNumbers(): void {
        this.currentPage = 1; // Reset to first page
        this.loadPage(1);
    }

    loadPage(page: number): void {
        this.loading = true;
        const filters: any = {};

        if (this.selectedSeasonId) filters.seasonId = this.selectedSeasonId;
        if (this.selectedUserId) filters.userId = this.selectedUserId;
        if (this.selectedNumber) filters.number = this.selectedNumber;
        if (this.startDate) filters.startDate = this.startDate;
        if (this.endDate) filters.endDate = this.endDate;

        this.adminService.getNumbers(filters, page, this.pageSize).subscribe({
            next: (response) => {
                this.numbers = response.data;
                this.filteredNumbers = response.data;
                this.currentPage = response.page;
                this.totalPages = response.totalPages;
                this.totalNumbers = response.total;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading numbers:', error);
                this.showMessage('Error al cargar números', 'error');
                this.loading = false;
            }
        });
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.loadPage(this.currentPage + 1);
        }
    }

    previousPage(): void {
        if (this.currentPage > 1) {
            this.loadPage(this.currentPage - 1);
        }
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.loadPage(page);
        }
    }

    loadUsers(): void {
        this.adminService.getUsers().subscribe({
            next: (data: any) => {
                this.users = data;
            },
            error: (error: any) => {
                console.error('Error loading users:', error);
            }
        });
    }

    loadSeasons(): void {
        this.adminService.getSeasons().subscribe({
            next: (data: any) => {
                this.seasons = data;
            },
            error: (error: any) => {
                console.error('Error loading seasons:', error);
            }
        });
    }

    applyFilters(): void {
        this.loadNumbers();
    }

    clearFilters(): void {
        this.selectedSeasonId = null;
        this.selectedUserId = null;
        this.selectedNumber = null;
        this.startDate = '';
        this.endDate = '';
        this.loadNumbers();
    }

    toggleAddForm(): void {
        this.showAddForm = !this.showAddForm;
        if (this.showAddForm) {
            // Reset form
            this.newNumber = {
                userId: null,
                seasonId: null,
                number: null,
                date: new Date().toISOString().split('T')[0]
            };
        }
    }

    addNumber(): void {
        if (!this.newNumber.userId || !this.newNumber.seasonId ||
            !this.newNumber.number || !this.newNumber.date) {
            this.showMessage('Por favor completa todos los campos', 'error');
            return;
        }

        if (this.newNumber.number < 10 || this.newNumber.number > 99) {
            this.showMessage('El número debe estar entre 10 y 99', 'error');
            return;
        }

        this.loading = true;
        this.adminService.addNumber(
            this.newNumber.userId,
            this.newNumber.seasonId,
            this.newNumber.number,
            this.newNumber.date
        ).subscribe({
            next: (response) => {
                this.showMessage('Número añadido correctamente', 'success');
                this.showAddForm = false;
                this.loadNumbers();
            },
            error: (error) => {
                console.error('Error adding number:', error);
                const errorMsg = error.error?.error || 'Error al añadir número';
                this.showMessage(errorMsg, 'error');
                this.loading = false;
            }
        });
    }

    startEdit(number: Number): void {
        this.editingId = number.id;
        this.editForm = {
            number: number.number,
            date: new Date(number.created_at).toISOString().split('T')[0]
        };
    }

    cancelEdit(): void {
        this.editingId = null;
        this.editForm = {
            number: null,
            date: ''
        };
    }

    saveEdit(id: number): void {
        if (!this.editForm.number && !this.editForm.date) {
            this.showMessage('Modifica al menos un campo', 'error');
            return;
        }

        if (this.editForm.number && (this.editForm.number < 10 || this.editForm.number > 99)) {
            this.showMessage('El número debe estar entre 10 y 99', 'error');
            return;
        }

        this.loading = true;
        const updates: any = {};
        if (this.editForm.number) updates.number = this.editForm.number;
        if (this.editForm.date) updates.date = this.editForm.date;

        this.adminService.editNumber(id, updates).subscribe({
            next: (response) => {
                this.showMessage('Número actualizado correctamente', 'success');
                this.editingId = null;
                this.loadNumbers();
            },
            error: (error) => {
                console.error('Error editing number:', error);
                const errorMsg = error.error?.error || 'Error al editar número';
                this.showMessage(errorMsg, 'error');
                this.loading = false;
            }
        });
    }

    deleteNumber(id: number, username: string, number: number): void {
        if (!confirm(`¿Estás seguro de que quieres eliminar el número ${number} del usuario ${username}?`)) {
            return;
        }

        this.loading = true;
        this.adminService.deleteNumber(id).subscribe({
            next: (response) => {
                this.showMessage('Número eliminado correctamente', 'success');
                this.loadNumbers();
            },
            error: (error) => {
                console.error('Error deleting number:', error);
                this.showMessage('Error al eliminar número', 'error');
                this.loading = false;
            }
        });
    }

    showMessage(msg: string, type: 'success' | 'error'): void {
        this.message = msg;
        this.messageType = type;
        setTimeout(() => {
            this.message = '';
        }, 5000);
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
}
