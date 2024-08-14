import { Component } from '@angular/core';
import { NumberService } from 'src/services/number/number.service';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { UserService } from 'src/services/user/user.service';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-clasification-donnut-chart',
  standalone: true,
  imports: [],
  templateUrl: './clasification-donnut-chart.component.html',
  styleUrls: ['./clasification-donnut-chart.component.scss']
})
export class ClasificationDonnutChartComponent {
  private chart: any;

  constructor(private userService: UserService) {
    this.getUsersQualy();
  }

  private async getUsersQualy() {
    console.log("Starting collecting user data");
    try {
      const response: any = await this.userService.getUserCLasification();
      this.processData(response);
    } catch (error) {
      console.error('Error retrieving user numbers:', error);
    }
  }

  private processData(data: { username: string, numberCount: number }[]) {
    if (Array.isArray(data) && data.length > 0) {
      const usernames = data.map(user => user.username);
      const remainingNumbers = data.map(user => 99 - user.numberCount);

      this.renderChart(usernames, remainingNumbers);
    }
  }

  private renderChart(labels: string[], data: number[]) {
    const ctx = (document.getElementById('barChart1') as HTMLCanvasElement).getContext('2d');
    if (ctx) {
      if (this.chart) {
        this.chart.destroy(); // Destroy the old chart instance if it exists
      }

      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Numbers Remaining to Reach 99',
              data: data,
              backgroundColor: '#36A2EB',
              borderColor: '#36A2EB',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Jugadores'
              }
            },
            y: {
              beginAtZero: true,
              max: 99,
              title: {
                display: true,
                text: 'Números restantes'
              }
            }
          },
          plugins: {
            legend: {
              display: false // Hide the legend if not needed
            },
            tooltip: {
              callbacks: {
                label: function(context: any) {
                  return `${context.label}: ${99 - context.raw} numeros obtenidos`;
                }
              }
            },
            datalabels: {
              color: '#FFF', // Text color for the labels
              anchor: 'end', // Position the label at the end of the bar
              align: 'start', // Align the label at the start of the bar (inside)
              formatter: function(value) {
                return value; // Display the numeric value
              },
              font: {
                size: 12 // Font size for the labels
              },
              clamp: true // Ensure labels fit inside the bars
            }
          }
        }
      });
    }
  }
}
