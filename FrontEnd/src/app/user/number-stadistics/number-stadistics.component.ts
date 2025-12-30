import { Component, OnInit } from '@angular/core';
import { NumberService } from 'src/services/number/number.service';
import { UserService } from 'src/services/user/user.service';
import { SeasonService } from 'src/app/services/season.service';

@Component({
  selector: 'app-number-stadistics',
  templateUrl: './number-stadistics.component.html',
  styleUrls: ['./number-stadistics.component.scss'],
})
export class NumberStadisticsComponent implements OnInit {


  mostFrequentNumber: number = 0 // Number that appears the most
  allNumbersIntroduced: number = 0 // Number that appears the least
  missingNumbers: number = 0; // Total numbers that have not appeared

  firstLineName: string = ""
  firstLineSubtext: string = ""
  secondLineName: string = ""
  secondLineSubtext: string = ""
  thirdLineName: string = ""
  thirdLineSubtext: string = ""

  firstBingoName: string = ""
  firstBingoSubtext: string = ""
  secondBingoName: string = ""
  secondBingoSubtext: string = ""
  thirdBingoName: string = ""
  thirdBingoSubtext: string = ""

  activeSeasonId: number | null = null;

  constructor(
    private numberService: NumberService,
    private userService: UserService,
    private seasonService: SeasonService
  ) {
    this.calculateStatistics()
  }
  ngOnInit() { }

  calculateStatistics() {
    // Get active season first
    this.seasonService.getActiveSeason().subscribe({
      next: (season) => {
        this.activeSeasonId = season.id;
        console.info('Active season:', season);

        // Load statistics for active season
        this.numberService.getStadistics(this.activeSeasonId).then((data: any) => {
          this.mostFrequentNumber = data.mostFrequentNumber
          this.allNumbersIntroduced = data.allNumbersIntroduced
          this.missingNumbers = data.missingNumbers
        }).catch(error => {
          console.error('Error loading statistics:', error);
        })

        this.userService.getLineRemaining(this.activeSeasonId).then((data: any) => {
          console.info('Line remaining data:', data);

          if (data && data.length > 0) {
            this.firstLineName = data[0]?.username || "N/A"
            if (data[0]?.fewestMissingLine) {
              if (data[0].fewestMissingLine.missingCount === 0 && data[0].fewestMissingLine.completedAt) {
                // Line is complete, show line and completion date
                const date = new Date(data[0].fewestMissingLine.completedAt);
                this.firstLineSubtext = "Línea " + data[0].fewestMissingLine.line + ", completada el " + date.toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                });
              } else {
                // Line not complete, show remaining numbers
                this.firstLineSubtext = "Línea " + data[0].fewestMissingLine.line + ", números restantes " + data[0].fewestMissingLine.missingCount;
              }
            } else {
              this.firstLineSubtext = "Sin datos";
            }
          } else {
            this.firstLineName = "N/A"
            this.firstLineSubtext = "Sin datos"
          }

          if (data && data.length > 1) {
            this.secondLineName = data[1]?.username || "N/A"
            if (data[1]?.fewestMissingLine) {
              if (data[1].fewestMissingLine.missingCount === 0 && data[1].fewestMissingLine.completedAt) {
                const date = new Date(data[1].fewestMissingLine.completedAt);
                this.secondLineSubtext = "Línea " + data[1].fewestMissingLine.line + ", completada el " + date.toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                });
              } else {
                this.secondLineSubtext = "Línea " + data[1].fewestMissingLine.line + ", números restantes " + data[1].fewestMissingLine.missingCount;
              }
            } else {
              this.secondLineSubtext = "Sin datos";
            }
          } else {
            this.secondLineName = "N/A"
            this.secondLineSubtext = "Sin datos"
          }

          if (data && data.length > 2) {
            this.thirdLineName = data[2]?.username || "N/A"
            if (data[2]?.fewestMissingLine) {
              if (data[2].fewestMissingLine.missingCount === 0 && data[2].fewestMissingLine.completedAt) {
                const date = new Date(data[2].fewestMissingLine.completedAt);
                this.thirdLineSubtext = "Línea " + data[2].fewestMissingLine.line + ", completada el " + date.toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                });
              } else {
                this.thirdLineSubtext = "Línea " + data[2].fewestMissingLine.line + ", números restantes " + data[2].fewestMissingLine.missingCount;
              }
            } else {
              this.thirdLineSubtext = "Sin datos";
            }
          } else {
            this.thirdLineName = "N/A"
            this.thirdLineSubtext = "Sin datos"
          }
        }).catch(error => {
          console.error('Error loading line remaining:', error);
        })

        this.userService.getUserClasification(this.activeSeasonId).then((data: any) => {
          console.info('User classification data:', data);

          if (data && data.length > 0) {
            this.firstBingoName = data[0]?.username || "N/A"
            this.firstBingoSubtext = data[0]?.numberCount !== undefined
              ? (90 - data[0].numberCount) + " para el BINGO"
              : "Sin datos"
          } else {
            this.firstBingoName = "N/A"
            this.firstBingoSubtext = "Sin datos"
          }

          if (data && data.length > 1) {
            this.secondBingoName = data[1]?.username || "N/A"
            this.secondBingoSubtext = data[1]?.numberCount !== undefined
              ? (90 - data[1].numberCount) + " para el BINGO"
              : "Sin datos"
          } else {
            this.secondBingoName = "N/A"
            this.secondBingoSubtext = "Sin datos"
          }

          if (data && data.length > 2) {
            this.thirdBingoName = data[2]?.username || "N/A"
            this.thirdBingoSubtext = data[2]?.numberCount !== undefined
              ? (90 - data[2].numberCount) + " para el BINGO"
              : "Sin datos"
          } else {
            this.thirdBingoName = "N/A"
            this.thirdBingoSubtext = "Sin datos"
          }
        }).catch(error => {
          console.error('Error loading user classification:', error);
        })
      },
      error: (error) => {
        console.error('Error loading active season:', error);
      }
    });
  }

}
