import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from 'src/app/services/user.service';

interface Winner {
  userId: number;
  username: string;
  name_surname: string;
  profile_image?: string;
  achievedAt: string;
  completedDecade?: string;
  numberCount?: number;
}

interface WinnersData {
  lineWinner: Winner | null;
  bingoWinner: Winner | null;
}

@Component({
  selector: 'app-winners-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './winners-display.component.html',
  styleUrl: './winners-display.component.scss'
})
export class WinnersDisplayComponent implements OnInit, OnChanges {
  @Input() seasonId?: number;  // Optional season ID input

  winners: WinnersData = {
    lineWinner: null,
    bingoWinner: null
  };
  loading: boolean = true;
  error: string | null = null;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadWinners();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['seasonId'] && !changes['seasonId'].firstChange) {
      this.loadWinners();
    }
  }

  loadWinners(): void {
    this.loading = true;
    this.error = null;
    console.log('Loading winners for season:', this.seasonId || 'active');

    this.userService.getSeasonWinners(this.seasonId).subscribe({
      next: (data) => {
        console.log('Winners data received:', data);
        console.log('Line winner:', data.lineWinner);
        console.log('Bingo winner:', data.bingoWinner);
        this.winners = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading winners:', err);
        this.error = 'Error al cargar los ganadores';
        this.loading = false;
      }
    });
  }

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

  getImageUrl(profileImage?: string): string {
    if (profileImage != null) {
      return profileImage;
    } else {
      return '../../../assets/user.png';
    }
  }
}
