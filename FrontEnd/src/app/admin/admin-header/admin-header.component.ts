import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-admin-header',
    templateUrl: './admin-header.component.html',
    styleUrls: ['./admin-header.component.scss']
})
export class AdminHeaderComponent implements OnInit {

    constructor(private router: Router) { }

    ngOnInit(): void {
    }

    logout() {
        // Don't remove tokens, just navigate back to user dashboard
        this.router.navigate(['/user/dashboard']); // Volver a la parte principal
    }
}
