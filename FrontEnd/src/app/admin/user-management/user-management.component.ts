import { Component, OnInit } from '@angular/core';
import { UserService, User, CreateUserData } from 'src/app/services/user.service';

@Component({
    selector: 'app-user-management',
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

    users: User[] = [];
    loading = false;
    showCreateForm = false;

    // New user form
    newUser: CreateUserData = {
        username: '',
        nameSurname: '',
        password: '',
        admin: false
    };

    constructor(private userService: UserService) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    /**
     * Load all users
     */
    loadUsers() {
        console.log('Loading users...');
        this.loading = true;
        this.userService.getAllUsers().subscribe({
            next: (users) => {
                console.log('Users loaded:', users);
                this.users = users;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading users:', error);
                this.loading = false;
            }
        });
    }

    /**
     * Toggle create form visibility
     */
    toggleCreateForm() {
        this.showCreateForm = !this.showCreateForm;
        if (!this.showCreateForm) {
            this.resetForm();
        }
    }

    /**
     * Create a new user
     */
    createUser() {
        if (!this.newUser.username || !this.newUser.nameSurname || !this.newUser.password) {
            alert('Please fill in all required fields');
            return;
        }

        if (this.newUser.username.length > 15) {
            alert('Username must be 15 characters or less');
            return;
        }

        if (this.newUser.nameSurname.length > 25) {
            alert('Name/Surname must be 25 characters or less');
            return;
        }

        this.loading = true;
        this.userService.createUser(this.newUser).subscribe({
            next: (response) => {
                console.log('User created:', response);
                alert('User created successfully');
                this.loadUsers();
                this.resetForm();
                this.showCreateForm = false;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error creating user:', error);
                if (error.status === 416) {
                    alert('User already exists');
                } else {
                    alert('Error creating user');
                }
                this.loading = false;
            }
        });
    }

    /**
     * Reset the form
     */
    resetForm() {
        this.newUser = {
            username: '',
            nameSurname: '',
            password: '',
            admin: false
        };
    }

    /**
     * Format date for display
     */
    formatDate(dateString: string | undefined): string {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    /**
     * Get role badge text
     */
    getRoleBadge(administrator: number): string {
        return administrator === 1 ? 'Admin' : 'User';
    }

    /**
     * Check if user is admin
     */
    isAdmin(administrator: number): boolean {
        return administrator === 1;
    }
}
