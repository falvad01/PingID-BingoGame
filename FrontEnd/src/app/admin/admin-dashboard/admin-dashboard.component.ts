import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SeasonService, Season } from 'src/app/services/season.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  activeSeason: Season | null = null;
  loading = false;

  constructor(
    private router: Router,
    private seasonService: SeasonService
  ) { }

  ngOnInit(): void {
    this.loadActiveSeason();
  }

  /**
   * Load active season
   */
  loadActiveSeason() {
    this.loading = true;
    this.seasonService.getActiveSeason().subscribe({
      next: (season) => {
        this.activeSeason = season;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading active season:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Navigate to season management
   */
  goToSeasonManagement() {
    this.router.navigate(['/admin/seasons']);
  }

  /**
   * Navigate to user management
   */
  goToUserManagement() {
    this.router.navigate(['/admin/users']);
  }
}
