import { Component, OnInit } from '@angular/core';
import { SeasonService, Season } from 'src/app/services/season.service';
import { UserService } from 'src/services/user/user.service';

@Component({
  selector: 'app-historical-view',
  templateUrl: './historical-view.component.html',
  styleUrls: ['./historical-view.component.scss']
})
export class HistoricalViewComponent implements OnInit {

  seasons: Season[] = [];
  selectedSeasonId: number | null = null;
  loading = false;

  // Historical data
  usersQualify: any[] = [];
  statistics: any = null;
  bingoLine: any[] = [];
  lineWinners: any[] = [];
  bingoWinners: any[] = [];

  constructor(
    private seasonService: SeasonService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadSeasons();
  }

  /**
   * Load all seasons
   */
  loadSeasons() {
    this.loading = true;
    this.seasonService.getAllSeasons().subscribe({
      next: (seasons) => {
        this.seasons = seasons;
        console.info('Seasons loaded:', seasons); // Debug log
        this.loading = false;

        // Auto-select the first season if available
        if (seasons.length > 0 && !this.selectedSeasonId) {
          this.selectedSeasonId = seasons[0].id;
          this.loadHistoricalData();
        }
      },
      error: (error) => {
        console.error('Error loading seasons:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Handle season selection change
   */
  onSeasonChange() {
    if (this.selectedSeasonId) {
      this.loadHistoricalData();
    }
  }

  /**
   * Load historical data for selected season
   */
  loadHistoricalData() {
    if (!this.selectedSeasonId) return;

    this.loading = true;

    // Load classification
    this.seasonService.getUsersQualify(this.selectedSeasonId).subscribe({
      next: (data) => {
        this.usersQualify = data;
      },
      error: (error) => console.error('Error loading classification:', error)
    });

    // Load statistics
    this.seasonService.getStatistics(this.selectedSeasonId).subscribe({
      next: (data) => {
        this.statistics = data;
      },
      error: (error) => console.error('Error loading statistics:', error)
    });

    // Load bingo line
    this.seasonService.getBingoLine(this.selectedSeasonId).subscribe({
      next: (data) => {
        this.bingoLine = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading bingo line:', error);
        this.loading = false;
      }
    });

    // Load line winners (historical list)
    this.userService.getLineWinners(this.selectedSeasonId).then((data: any) => {
      this.lineWinners = data;
      console.info('Line winners loaded:', data);
    }).catch(error => {
      console.error('Error loading line winners:', error);
    });

    // Load bingo winners (historical list)
    this.userService.getBingoWinners(this.selectedSeasonId).then((data: any) => {
      this.bingoWinners = data;
      console.info('Bingo winners loaded:', data);
    }).catch(error => {
      console.error('Error loading bingo winners:', error);
    });
  }

  /**
   * Get selected season name
   */
  getSelectedSeasonName(): string {
    const season = this.seasons.find(s => s.id === this.selectedSeasonId);
    return season ? season.name : '';
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * Get profile image URL
   */
  getImageUrl(profileImage: string): string {
    if (!profileImage) {
      return 'assets/avatarVoid.png';
    }
    return profileImage;
  }
}
