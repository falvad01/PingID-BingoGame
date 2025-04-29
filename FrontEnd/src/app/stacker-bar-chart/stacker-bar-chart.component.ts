import { Component } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { UserService } from 'src/services/user/user.service';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables, ChartDataLabels);


@Component({
  selector: 'app-stacker-bar-chart',
  standalone: true,
  imports: [],
  templateUrl: './stacker-bar-chart.component.html',
  styleUrl: './stacker-bar-chart.component.scss'
})
export class StackerBarChartComponent {
  chart: any;


  constructor(private userService: UserService) {

  }

  ngOnInit(): void {
    console.log("Starting collectiong user data")

    this.userService.getUserClasification().then(data => {
      this.createChart(data);
    }).catch(error => {
      console.error('Error retrieving user numbers:', error);
    })


  }

  createChart(data: any) {
    console.log("Starting collecting user data" + data);
    // Validate that `data` is a non-empty array
    if (!Array.isArray(data) || data.length === 0) {
      console.error('Invalid data provided for chart creation.');
      return;
    }

    // Filter out users where both non-repeated and repeated counts are 0
    const filteredData = data.filter((user: any) =>
      Math.max(user.numberCount - user.repeatedCount, 0) > 0 || Math.max(user.totalRepetitions, 0) > 0
    );

    // Extract usernames, non-repeated counts, and repeated counts from the filtered data
    const usernames = filteredData.map((user: any) => user.username);
    const nonRepeatedCounts = filteredData.map((user: any) => Math.max(user.numberCount - user.repeatedCount, 0)); // Ensure non-negative values
    const repeatedCounts = filteredData.map((user: any) => Math.max(user.totalRepetitions, 0)); // Ensure non-negative values

    // Create the chart
    this.chart = new Chart("myChart", {
      type: 'bar',
      data: {
        labels: usernames,
        datasets: [
          {
            label: 'Números Sin Repetir',
            data: nonRepeatedCounts,
            backgroundColor: '#4caf50', // Color for non-repeated numbers
            borderColor: '#36A2EB',
          },
          {
            label: 'Números Repetidos',
            data: repeatedCounts,
            backgroundColor: '#2196f3', // Color for repeated numbers
            borderColor: '#36A2EB',
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          datalabels: {
            color: '#FFF', // Text color for the labels
            formatter: function (value) {
              return value; // Display the numeric value
            },
            font: {
              size: 12 // Font size for the labels
            },
            clamp: true // Ensure labels fit inside the bars
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.dataset.label || '';
                const value = context.raw;
                return `${label}: ${value}`;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: 'Usuarios',
              color: 'white', // Change x-axis label color to white
            },
            ticks: {
              color: 'white', // Change x-axis tick color to white
            }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cantidad',
              color: 'white', // Change y-axis label color to white
            },
            ticks: {
              color: 'white', // Change y-axis tick color to white
              precision: 0
            }
          }
        }
      }
    });
  }
}
