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
    console.log("Starting collectiong user data" + data)
    // Validar que `data` es un array no vacío
    if (!Array.isArray(data) || data.length === 0) {
      console.error('Invalid data provided for chart creation.');
      return;
    }

    // Extraer los nombres de usuario, números sin repetir y números repetidos
    const usernames = data.map((user: any) => user.username);
    const nonRepeatedCounts = data.map((user: any) => Math.max(user.numberCount - user.repeatedCount, 0)); // Asegurarse de que los valores no sean negativos
    const repeatedCounts = data.map((user: any) => Math.max(user.repeatedCount, 0)); // Asegurarse de que los valores no sean negativos

    // Crear el gráfico
    this.chart = new Chart("myChart", {
      type: 'bar',
      data: {
        labels: usernames,
        datasets: [
          {
            label: 'Números Sin Repetir',
            data: nonRepeatedCounts,
            backgroundColor: '#4caf50',
            borderColor: '#36A2EB',// Color para números sin repetir
          },
          {
            label: 'Números Repetidos',
            data: repeatedCounts,
            backgroundColor: '#2196f3',
            borderColor: '#36A2EB', // Color para números repetidos
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
              color: 'white', // Cambia el color de las etiquetas del eje x a blanco
            },
            ticks: {
              color: 'white', // Cambia el color de los ticks del eje x a blanco
            }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cantidad',
              color: 'white', // Cambia el color de las etiquetas del eje y a blanco
            },
            ticks: {
              color: 'white', // Cambia el color de los ticks del eje y a blanco
              precision: 0
            }
          }

        }
      }
    });

  }
}
