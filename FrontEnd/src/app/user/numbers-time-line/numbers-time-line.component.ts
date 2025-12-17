import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { NumberService } from 'src/services/number/number.service';
import { SeasonService } from 'src/app/services/season.service';
import { Buffer } from 'buffer';

@Component({
  selector: 'app-numbers-time-line',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './numbers-time-line.component.html',
  styleUrls: ['./numbers-time-line.component.scss']
})
export class NumbersTimeLineComponent {
  todayNumbers: any;
  activeSeasonId: number | null = null;

  constructor(
    private numberService: NumberService,
    private seasonService: SeasonService
  ) {
    this.getTodayNumbers();
  }

  /**
   * Obtener los números introducidos en el día actual
   */
  getTodayNumbers() {
    // Get active season first
    this.seasonService.getActiveSeason().subscribe({
      next: (season) => {
        this.activeSeasonId = season.id;
        console.log('Active season:', season);

        // Get today's numbers for active season
        this.numberService.getDayNumbers(this.activeSeasonId).then((data: any) => {
          console.log('Today numbers: ', data);
          // Convertir el array de bytes en una URL para cada imagen de usuario
          this.todayNumbers = data.map((td: any) => {
            // Convierte el buffer de la imagen a una URL de imagen en base64
            return {
              ...td,
              text: this.getText(td.alreadyExists),
              class: this.getClass(td.alreadyExists),
            };
          });
          console.log(this.todayNumbers);
        }).catch(error => {
          console.error('Error fetching today numbers:', error);
        });
      },
      error: (error) => {
        console.error('Error loading active season:', error);
      }
    });
  }

  getClass(exists: any) {
    return exists ? "badge-custom-repeated" : "badge-custom";
  }


  /**
   * Obtiene el texto basado en si el número ya existe.
   * 
   * @param exists Booleano que indica si el número ya existe.
   * @returns El mensaje apropiado.
   */
  getText(exists: boolean): string {
    return exists ? "El número es repetido" : "El número es nuevo";
  }
}
