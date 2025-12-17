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
        console.log('Active season:', season);

        // Load statistics for active season
        this.numberService.getStadistics(this.activeSeasonId).then((data: any) => {
          this.mostFrequentNumber = data.mostFrequentNumber
          this.allNumbersIntroduced = data.allNumbersIntroduced
          this.missingNumbers = data.missingNumbers
        }).catch(error => {
          console.error('Error loading statistics:', error);
        })

        this.userService.getLineRemaining(this.activeSeasonId).then((data: any) => {
          console.log('Line remaining data:', data);

          if (data && data.length > 0) {
            this.firstLineName = data[0]?.username || "N/A"
            this.firstLineSubtext = data[0]?.fewestMissingLine
              ? "Línea " + data[0].fewestMissingLine.line + ", números restantes " + data[0].fewestMissingLine.missingCount
              : "Sin datos"
          } else {
            this.firstLineName = "N/A"
            this.firstLineSubtext = "Sin datos"
          }

          if (data && data.length > 1) {
            this.secondLineName = data[1]?.username || "N/A"
            this.secondLineSubtext = data[1]?.fewestMissingLine
              ? "Línea " + data[1].fewestMissingLine.line + ", números restantes " + data[1].fewestMissingLine.missingCount
              : "Sin datos"
          } else {
            this.secondLineName = "N/A"
            this.secondLineSubtext = "Sin datos"
          }

          if (data && data.length > 2) {
            this.thirdLineName = data[2]?.username || "N/A"
            this.thirdLineSubtext = data[2]?.fewestMissingLine
              ? "Línea " + data[2].fewestMissingLine.line + ", números restantes " + data[2].fewestMissingLine.missingCount
              : "Sin datos"
          } else {
            this.thirdLineName = "N/A"
            this.thirdLineSubtext = "Sin datos"
          }
        }).catch(error => {
          console.error('Error loading line remaining:', error);
        })

        this.userService.getUserClasification(this.activeSeasonId).then((data: any) => {
          console.log('User classification data:', data);

          if (data && data.length > 0) {
            this.firstBingoName = data[0]?.username || "N/A"
            this.firstBingoSubtext = data[0]?.numberCount !== undefined
              ? (89 - data[0].numberCount) + " para el BINGO"
              : "Sin datos"
          } else {
            this.firstBingoName = "N/A"
            this.firstBingoSubtext = "Sin datos"
          }

          if (data && data.length > 1) {
            this.secondBingoName = data[1]?.username || "N/A"
            this.secondBingoSubtext = data[1]?.numberCount !== undefined
              ? (89 - data[1].numberCount) + " para el BINGO"
              : "Sin datos"
          } else {
            this.secondBingoName = "N/A"
            this.secondBingoSubtext = "Sin datos"
          }

          if (data && data.length > 2) {
            this.thirdBingoName = data[2]?.username || "N/A"
            this.thirdBingoSubtext = data[2]?.numberCount !== undefined
              ? (89 - data[2].numberCount) + " para el BINGO"
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
