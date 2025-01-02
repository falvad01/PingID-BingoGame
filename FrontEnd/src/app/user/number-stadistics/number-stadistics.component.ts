import { Component, OnInit } from '@angular/core';
import { NumberService } from 'src/services/number/number.service';
import { UserService } from 'src/services/user/user.service';

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

  constructor(private numberService: NumberService, private userService: UserService) {
    this.calculateStatistics()
  }
  ngOnInit() { }

  calculateStatistics() {

    this.numberService.getStadistics().then((data: any) => {

      this.mostFrequentNumber = data.mostFrequentNumber
      this.allNumbersIntroduced = data.allNumbersIntroduced
      this.missingNumbers = data.missingNumbers

    }).catch(error => {

    })

    this.userService.getLineRemaining().then((data: any) => {

      this.firstLineName = data[0].username
      this.firstLineSubtext = "Línea " + data[0].fewestMissingLine.line + ", números restantes " + data[0].fewestMissingLine.missingCount

      this.secondLineName = data[1].username
      this.secondLineSubtext = "Línea " + data[1].fewestMissingLine.line + ", números restantes " + data[1].fewestMissingLine.missingCount

      this.thirdLineName = data[2].username
      this.thirdLineSubtext = "Línea " + data[2].fewestMissingLine.line + ", números restantes " + data[2].fewestMissingLine.missingCount

    }).catch(error => {

    })

    this.userService.getUserClasification().then((data: any) => {

      this.firstBingoName = data[0].username
      this.firstBingoSubtext = 89 - data[0].numberCount + " para el BINGO"

      this.secondBingoName = data[1].username
      this.secondBingoSubtext = 89 - data[1].numberCount + " para el BINGO"

      this.thirdBingoName = data[2].username
      this.thirdBingoSubtext = 89 - data[2].numberCount + " para el BINGO"

    }).catch(error => {

    })
  }

}
