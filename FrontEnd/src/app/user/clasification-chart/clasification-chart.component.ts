import { Component } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { UserService } from 'src/services/user/user.service';

// Register Chart.js components and plugins
Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-clasification-chart',
  standalone: true,
  imports: [],
  templateUrl: './clasification-chart.component.html',
  styleUrls: ['./clasification-chart.component.scss']
})
export class ClasificationChartComponent {
  private chart: any; // Holds the Chart.js instance

  constructor(private userService: UserService) {
    // Fetch user classification data when the component is initialized
    this.getUsersQualy();
  }

  /**
   * Fetches user classification data from the UserService.
   * Logs an error if the data retrieval fails.
   */
  private async getUsersQualy() {
    console.log("Starting collecting user data");

    this.userService.getUserClasification()
      .then(data => {
        this.processData(data); // Process the retrieved data
      })
      .catch(error => {
        console.error('Error retrieving user numbers:', error); // Log errors
      });
  }

  /**
   * Processes the user classification data.
   * Filters out users with a remaining number of 99.
   * Extracts usernames and calculates remaining numbers to reach 99.
   * @param data - Array of user data objects
   */
  private processData(data: any) {
    if (Array.isArray(data) && data.length > 0) {
      // Filter out users where the remaining number is 99
      const filteredData = data.filter(user => 89 - user.numberCount !== 89);

      // Extract usernames and remaining numbers from the filtered data
      const usernames = filteredData.map(user => user.username);
      const remainingNumbers = filteredData.map(user => 89 - user.numberCount);

      // Render the chart with the filtered data
      this.renderChart(usernames, remainingNumbers);
    }
  }

  /**
   * Renders a bar chart using Chart.js.
   * Destroys the previous chart instance if it exists.
   * @param labels - Array of usernames to display on the x-axis
   * @param data - Array of remaining numbers to display on the y-axis
   */
  private renderChart(labels: string[], data: number[]) {
    const ctx = (document.getElementById('barChart1') as HTMLCanvasElement).getContext('2d');
    if (ctx) {
      // Destroy the old chart instance if it exists
      if (this.chart) {
        this.chart.destroy();
      }

      // Create a new Chart.js instance
      this.chart = new Chart(ctx, {
        type: 'bar', // Bar chart type
        data: {
          labels: labels, // X-axis labels (usernames)
          datasets: [
            {
              label: 'Numbers Remaining to Reach 99', // Dataset label
              data: data, // Y-axis data (remaining numbers)
              backgroundColor: '#36A2EB', // Bar color
              borderColor: '#36A2EB', // Bar border color
              borderWidth: 1 // Bar border width
            }
          ]
        },
        options: {
          responsive: true, // Make the chart responsive
          maintainAspectRatio: false, // Allow custom aspect ratio
          scales: {
            x: {
              beginAtZero: true, // Start x-axis at zero
              title: {
                display: true,
                text: 'Jugadores' // X-axis title
              }
            },
            y: {
              beginAtZero: true, // Start y-axis at zero
              max: 89, // Set maximum value for y-axis
              title: {
                display: true,
                text: 'Números restantes' // Y-axis title
              }
            }
          },
          plugins: {
            legend: {
              display: false // Hide the legend
            },
            tooltip: {
              callbacks: {
                // Custom tooltip format
                label: function (context: any) {
                  return `${context.label}: ${89 - context.raw} numeros obtenidos`;
                }
              }
            },
            datalabels: {
              color: '#FFF', // Label text color
              anchor: 'end', // Position label at the end of the bar
              align: 'start', // Align label inside the bar
              formatter: function (value) {
                return value; // Display the numeric value
              },
              font: {
                size: 12 // Font size for labels
              },
              clamp: true // Ensure labels fit inside the bars
            }
          }
        }
      });
    }
  }
}