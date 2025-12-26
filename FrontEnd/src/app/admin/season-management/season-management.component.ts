import { Component, OnInit } from '@angular/core';
import { SeasonService, Season } from 'src/app/services/season.service';

@Component({
  selector: 'app-season-management',
  templateUrl: './season-management.component.html',
  styleUrls: ['./season-management.component.scss']
})
export class SeasonManagementComponent implements OnInit {

  seasons: Season[] = [];
  loading = false;
  showCreateForm = false;

  // New season form
  newSeason = {
    name: '',
    start_date: '',
    end_date: '',
    is_active: false
  };

  constructor(private seasonService: SeasonService) { }

  ngOnInit(): void {
    this.loadSeasons();
  }

  /**
   * Load all seasons
   */
  loadSeasons() {
    console.info('Loading seasons...');
    this.loading = true;
    this.seasonService.getAllSeasons().subscribe({
      next: (seasons) => {
        console.info('Seasons loaded:', seasons);
        this.seasons = seasons;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading seasons:', error);
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
   * Create a new season
   */
  createSeason() {
    if (!this.newSeason.name) {
      alert('Season name is required');
      return;
    }

    this.loading = true;
    this.seasonService.createSeason(this.newSeason).subscribe({
      next: (response) => {
        console.info('Season created:', response);
        this.loadSeasons();
        this.resetForm();
        this.showCreateForm = false;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error creating season:', error);
        alert('Error creating season');
        this.loading = false;
      }
    });
  }

  /**
   * Activate a season
   */
  activateSeason(seasonId: number) {
    const confirmed = confirm('Are you sure you want to activate this season? This will deactivate the current active season.');
    if (!confirmed) return;

    this.loading = true;
    this.seasonService.activateSeason(seasonId).subscribe({
      next: (response) => {
        console.info('Season activated:', response);
        this.loadSeasons();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error activating season:', error);
        alert('Error activating season');
        this.loading = false;
      }
    });
  }

  /**
   * Reset the form
   */
  resetForm() {
    this.newSeason = {
      name: '',
      start_date: '',
      end_date: '',
      is_active: false
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
}
