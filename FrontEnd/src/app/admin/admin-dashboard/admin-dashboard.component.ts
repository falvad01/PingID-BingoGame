import { Component, OnInit } from '@angular/core';
import { NumberService } from 'src/services/number/number.service';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, BarController } from 'chart.js';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {

  constructor(private numberService: NumberService) {
    Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, BarController);

  }

  ngOnInit() {
    this.obtainMarkedNumbers();
  }

  /**
   * Obtain the numbers from the backend service.
   * Calls the NumberService to retrieve user numbers and then processes the data.
   */
  obtainMarkedNumbers() {
    // this.numberService.retrieveAllNumbers().then((response: any) => {
    //   // this.processApiResponse(response);
    //   // this.calculateStatistics(); // Calculate statistics after processing the response
    //   // this.createChart(response);
    // }).catch((error: any) => {
    //   console.error('Error fetching data:', error);
    // });
  }

  

  // // Function to calculate statistics
  // calculateStatistics() {
  //   const counts = Object.values(this.repetitionCounts);

  //   // Total numbers that have appeared
  //   this.totalNumbers = this.greenNumbers.length;

  //   // Calculate the most and least frequent numbers
  //   if (counts.length > 0) {
  //     const maxCount = Math.max(...counts);
  //     const minCount = Math.min(...counts);

  //     this.mostFrequentNumber = Number(Object.keys(this.repetitionCounts).find(num => this.repetitionCounts[+num] === maxCount) || null);
  //     this.leastFrequentNumber = Number(Object.keys(this.repetitionCounts).find(num => this.repetitionCounts[+num] === minCount) || null);
  //   } else {
  //     this.mostFrequentNumber = null;
  //     this.leastFrequentNumber = null;
  //   }

  //   // Total numbers that have not appeared
  //   this.missingNumbers = this.numbers.length - this.totalNumbers;

  //   // Count of numbers that have appeared only once
  //   this.onceAppearedCount = this.greenNumbers.length - this.blueNumbers.length
  //   // Count of numbers that have appeared more than once
  //   this.moreThanOnceCount = this.blueNumbers.length
  // }

 

 

  // private createChart(data: any) {
  //   const ctx = (document.getElementById('barChart') as HTMLCanvasElement).getContext('2d');

  //   if (ctx) {
  //     const counts = new Array(99).fill(0);

  //     data.forEach((item: any) => {
  //       if (item.number >= 1 && item.number <= 99) {
  //         counts[item.number - 1]++;
  //       }
  //     });

  //     new Chart(ctx, {
  //       type: 'bar',
  //       data: {
  //         labels: counts.map((_, index) => index + 1),
  //         datasets: [{
  //           label: 'Frecuencia',
  //           data: counts,
  //           backgroundColor: '#007bff'
  //         }]
  //       },
  //       options: {
  //         responsive: true,
  //         scales: {
  //           x: {
  //             title: {
  //               display: true,
  //               text: 'Número'
  //             }
              
  //           },
  //           y: {
  //             title: {
  //               display: true,
  //               text: 'Frecuencia'
  //             },
  //             beginAtZero: true,
  //             ticks: {
  //               stepSize: 1, // Asegura que los números enteros sean visibles
  //               callback: function(value) {
  //                 return Number.isInteger(value) ? value : '';
  //               }
  //             },
  //             min: 0, // Asegura que el eje empiece en 0
  //             max: Math.max(...counts) + 1 // Asegura que el eje llegue al máximo valor + 1
  //           }
  //         }
  //       }
  //     });
  //   }
  // }
}

