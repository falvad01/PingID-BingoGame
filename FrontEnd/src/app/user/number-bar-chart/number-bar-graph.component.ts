import { Component, OnInit } from '@angular/core';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, BarController, ChartData, ChartOptions } from 'chart.js';
import { NumberService } from 'src/services/number/number.service';

@Component({
  selector: 'app-number-bar-chart',
  standalone: true,
  templateUrl: './number-bar-chart.component.html',
  styleUrls: ['./number-bar-chart.component.scss'],
})
export class NumberBarChartComponent implements OnInit {

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
    this.numberService.retrieveAllNumbers().then((response: any) => {
      this.createChart(response);
    }).catch((error: any) => {
      console.error('Error fetching data:', error);
    });
  }

  private createChart(data: any) {
    const ctx = (document.getElementById('barChart') as HTMLCanvasElement).getContext('2d');

    if (ctx) {
      // Initialize counts for numbers 1 to 99
      const counts = new Array(99).fill(0);

      // Process the response data to count occurrences
      data.forEach((item: any) => {
        if (item.number >= 1 && item.number <= 99) {
          counts[item.number - 1] = item.repetitions; // Use repetitions directly
        }
      });

      // Create the chart
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Array.from({ length: 99 }, (_, i) => i + 1), // Labels from 1 to 99
          datasets: [{
            label: 'Frecuencia',
            data: counts,
            backgroundColor: '#007bff'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            // Configuration for displaying labels on top of bars
            datalabels: {
              color: '#ffffff',
              anchor: 'end',
              align: 'top',
              formatter: (value: number) => value > 0 ? value.toString() : '', // Display the value only if greater than 0
              font: {
                weight: 'bold',
                size: 12
              }
            },
            legend: {
              display: true
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `Número ${context.label}: ${context.raw}`;
                }
              }
            }
          },
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
                stepSize: 1, // Ensure integers are visible
                callback: function(value) {
                  return Number.isInteger(value) ? value : '';
                }
              },
              min: 0, // Ensure the axis starts at 0
              max: Math.max(...counts) + 1 // Ensure the axis reaches the maximum value + 1
            }
          }
        }
      });
    }
  }
}
