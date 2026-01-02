import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/services/user/user.service';
import { NumberService } from 'src/services/number/number.service';
import { ThemeService } from 'src/services/theme/theme.service';
import { SeasonService } from 'src/app/services/season.service';

interface DashboardStats {
  totalNumbers: number;
  uniqueNumbers: number;
  repeatedNumbers: number;
  currentStreak: number;
  bestStreak: number;
  rankingPosition: number;
  todayNumber?: number;
  isTodayNumberNew?: boolean;
  lastActivity: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  stats: DashboardStats = {
    totalNumbers: 0,
    uniqueNumbers: 0,
    repeatedNumbers: 0,
    currentStreak: 0,
    bestStreak: 0,
    rankingPosition: 0,
    lastActivity: 'Hoy'
  };

  loading = true;
  userName = '';
  userAvatar = '';
  activeSeasonId: number | null = null;

  constructor(
    private userService: UserService,
    private numberService: NumberService,
    public themeService: ThemeService,
    private seasonService: SeasonService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  async loadDashboardData() {
    try {
      this.loading = true;
      console.info('Loading dashboard data...');

      // Get active season first
      this.seasonService.getActiveSeason().subscribe({
        next: async (season) => {
          this.activeSeasonId = season.id;
          console.info('Active season:', season);

          // Load user numbers statistics for active season
          const numbers: any = await this.numberService.retrieveAllUserNumbers(this.activeSeasonId);
          console.info('Retrieved numbers:', numbers);

          if (numbers && Array.isArray(numbers)) {
            // Filter out numbers with count 0 (numbers the user has never received)
            const userNumbers = numbers.filter((n: any) => n.count > 0);
            console.info('User numbers (filtered):', userNumbers);

            // Calculate unique numbers (only numbers that the user has at least once)
            this.stats.uniqueNumbers = userNumbers.length + 1;

            // Calculate total number count (sum of all counts)
            this.stats.totalNumbers = userNumbers.reduce((sum: number, n: any) => sum + n.count, 0);

            // Calculate repeated numbers (numbers that appear more than once)
            this.stats.repeatedNumbers = userNumbers.filter((n: any) => n.count > 1).length;

            // Get today's number if exists
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let todayNumber = null;

            // Search through all user numbers and their dates
            for (const num of userNumbers) {
              if (num.dates && Array.isArray(num.dates)) {
                const foundToday = num.dates.find((dateStr: string) => {
                  const numDate = new Date(dateStr);
                  numDate.setHours(0, 0, 0, 0);
                  return numDate.getTime() === today.getTime();
                });
                if (foundToday) {
                  todayNumber = num.number;
                  // Check if this is the first time (new) or repeated
                  this.stats.isTodayNumberNew = num.count === 1;
                  break;
                }
              }
            }

            if (todayNumber) {
              this.stats.todayNumber = todayNumber;
            }

            console.info('Dashboard stats calculated:', this.stats);
          } else {
            console.warn('No numbers data or invalid format:', numbers);
          }

          // TODO: Load streak data when backend endpoint is ready
          this.stats.currentStreak = 0;
          this.stats.bestStreak = 0;

          // TODO: Load ranking position when endpoint is ready
          this.stats.rankingPosition = 0;

          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading active season:', error);
          this.loading = false;
        }
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.loading = false;
      // Set defaults on error
      this.stats = {
        totalNumbers: 0,
        uniqueNumbers: 0,
        repeatedNumbers: 0,
        currentStreak: 0,
        bestStreak: 0,
        rankingPosition: 0,
        lastActivity: 'Error al cargar'
      };
    }
  }

  refreshData() {
    this.loadDashboardData();
  }
}
