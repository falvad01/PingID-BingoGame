import { Component, OnInit } from '@angular/core';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, BarController } from 'chart.js';
import { NumberService } from 'src/services/number/number.service';


@Component({
  selector: 'app-number-bar-graph',
  templateUrl: './number-bar-graph.component.html',
  styleUrls: ['./number-bar-graph.component.scss'],
})
export class NumberBarGraphComponent  implements OnInit {

  constructor(private numberService: NumberService) {
    Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, BarController);
    this.obtainMarkedNumbers();

   }

  ngOnInit() {}

  /**
   * Obtain the numbers from the backend service.
   * Calls the NumberService to retrieve user numbers and then processes the data.
   */
  obtainMarkedNumbers() {
    this.numberService.retrieveAllNumbers().then((response: any) => {
      this.createChart(response);
    }).catch((error: any) => {
      console.error('Error fetching data:', error);
    });
  }


  private createChart(data: any) {
    const ctx = (document.getElementById('barChart') as HTMLCanvasElement).getContext('2d');

    if (ctx) {
      const counts = new Array(99).fill(0);

      data.forEach((item: any) => {
        if (item.number >= 1 && item.number <= 99) {
          counts[item.number - 1]++;
        }
      });

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: counts.map((_, index) => index + 1),
          datasets: [{
            label: 'Frecuencia',
            data: counts,
            backgroundColor: '#007bff'
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Número'
              }
              
            },
            y: {
              title: {
                display: true,
                text: 'Frecuencia'
              },
              beginAtZero: true,
              ticks: {
                stepSize: 1, // Asegura que los números enteros sean visibles
                callback: function(value) {
                  return Number.isInteger(value) ? value : '';
                }
              },
              min: 0, // Asegura que el eje empiece en 0
              max: Math.max(...counts) + 1 // Asegura que el eje llegue al máximo valor + 1
            }
          }
        }
      });
    }
  }

}
