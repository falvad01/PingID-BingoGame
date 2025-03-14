import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { NumberService } from 'src/services/number/number.service';
import { Buffer } from 'buffer';

@Component({
  selector: 'app-numbers-time-line',
  standalone: true,
  imports: [NgFor],
  templateUrl: './numbers-time-line.component.html',
  styleUrls: ['./numbers-time-line.component.scss']
})
export class NumbersTimeLineComponent {
  todayNumbers: any;

  constructor(private numberService: NumberService) {
    this.getTodayNumbers();
  }

  /**
   * Obtener los números introducidos en el día actual
   */
  getTodayNumbers() {
    this.numberService.getDayNumbers().then((data: any) => {
      console.log('Today numbers: ', data);
      // Convertir el array de bytes en una URL para cada imagen de usuario
      this.todayNumbers = data.map((td: any) => {
        // Convierte el buffer de la imagen a una URL de imagen en base64
        return {
          ...td,
          text: this.getText(td.alreadyExists)
        };
      });
      console.log(this.todayNumbers);
    }).catch(error => {
      console.error('Error fetching today numbers:', error);
    });
  }

 
  /**
   * Obtiene el texto basado en si el número ya existe.
   * @param exists Booleano que indica si el número ya existe.
   * @returns El mensaje apropiado.
   */
  getText(exists: boolean): string {
    return exists ? "El número es repetido" : "El número es nuevo";
  }
}
