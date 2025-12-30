import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { NumberService } from 'src/services/number/number.service';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-distribution-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './distribution-charts.component.html',
  styleUrls: ['./distribution-charts.component.scss']
})
export class DistributionChartsComponent implements OnInit {
  private donutChart: any;
  private decadesChart: any;
  private polarChart: any;

  constructor(private numberService: NumberService) { }

  ngOnInit() {
    this.loadChartsData();
  }

  private async loadChartsData() {
    try {
      const response = await this.numberService.retrieveAllNumbers() as any;

      // Extract numbers array
      let allNumbers: any[];
      if (response && response.numbers && Array.isArray(response.numbers)) {
        allNumbers = response.numbers;
      } else if (Array.isArray(response)) {
        allNumbers = response;
      } else {
        allNumbers = [];
      }

      // Filter valid range
      const validNumbers = allNumbers.filter((num: any) => num.number >= 10 && num.number <= 99);

      this.createDonutChart(validNumbers);
      this.createDecadesChart(validNumbers);
      this.createPolarChart(validNumbers);

    } catch (error) {
      console.error('Error loading charts data:', error);
    }
  }

  private createDonutChart(numbers: any[]) {
    const ctx = (document.getElementById('donutChart') as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;

    // Calculate even vs odd based on REPETITIONS (real entries)
    let evenCount = 0;
    let oddCount = 0;

    numbers.forEach(num => {
      if (num.number % 2 === 0) {
        evenCount += num.repetitions; // Count all entries
      } else {
        oddCount += num.repetitions; // Count all entries
      }
    });

    // Calculate obtained vs missing
    const totalPossible = 90;
    const obtained = numbers.length;
    const missing = totalPossible - obtained;

    if (this.donutChart) {
      this.donutChart.destroy();
    }

    this.donutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Números Pares', 'Números Impares'],
        datasets: [{
          label: 'Introducciones',
          data: [evenCount, oddCount],
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 99, 132, 0.8)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#ffffff',
              font: {
                size: 14,
                weight: 'bold'
              },
              padding: 15
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = evenCount + oddCount;
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} introducciones (${percentage}%)`;
              }
            }
          },
          datalabels: {
            color: '#ffffff',
            font: {
              size: 16,
              weight: 'bold'
            },
            formatter: (value: any) => {
              return value;
            }
          }
        }
      }
    });
  }

  private createDecadesChart(numbers: any[]) {
    const ctx = (document.getElementById('decadesChart') as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;

    // Count REPETITIONS (entries) by decade, not unique numbers
    const decades = {
      '10-19': 0,
      '20-29': 0,
      '30-39': 0,
      '40-49': 0,
      '50-59': 0,
      '60-69': 0,
      '70-79': 0,
      '80-89': 0,
      '90-99': 0
    };

    numbers.forEach(num => {
      const decade = Math.floor(num.number / 10) * 10;
      const key = `${decade}-${decade + 9}`;
      if (decades.hasOwnProperty(key)) {
        decades[key as keyof typeof decades] += num.repetitions; // Sum all repetitions
      }
    });

    if (this.decadesChart) {
      this.decadesChart.destroy();
    }

    this.decadesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(decades),
        datasets: [{
          label: 'Introducciones por Decena',
          data: Object.values(decades),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 30
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Decenas',
              color: '#ffffff',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 13,
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Introducciones',
              color: '#ffffff',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 13,
                weight: 'bold'
              },
              stepSize: 1
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          datalabels: {
            anchor: 'end',
            align: 'top',
            color: '#ffffff',
            font: {
              size: 14,
              weight: 'bold'
            },
            formatter: (value: any) => {
              return value;
            }
          }
        }
      }
    });
  }

  private createPolarChart(numbers: any[]) {
    const ctx = (document.getElementById('polarChart') as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;

    // Get top 10 most frequent numbers
    const sortedNumbers = [...numbers]
      .sort((a, b) => b.repetitions - a.repetitions)
      .slice(0, 10);

    if (this.polarChart) {
      this.polarChart.destroy();
    }

    this.polarChart = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: sortedNumbers.map(n => `Nº ${n.number}`),
        datasets: [{
          label: 'Frecuencia',
          data: sortedNumbers.map(n => n.repetitions),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(199, 199, 199, 0.6)',
            'rgba(83, 102, 255, 0.6)',
            'rgba(255, 102, 178, 0.6)',
            'rgba(102, 255, 178, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(199, 199, 199, 1)',
            'rgba(83, 102, 255, 1)',
            'rgba(255, 102, 178, 1)',
            'rgba(102, 255, 178, 1)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            ticks: {
              color: '#ffffff',
              font: {
                size: 13,
                weight: 'bold'
              },
              stepSize: 1,
              backdropColor: 'transparent'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            pointLabels: {
              color: '#ffffff',
              font: {
                size: 13,
                weight: 'bold'
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          datalabels: {
            color: '#ffffff',
            font: {
              size: 14,
              weight: 'bold'
            },
            formatter: (value: any) => {
              return value;
            }
          }
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.donutChart) this.donutChart.destroy();
    if (this.decadesChart) this.decadesChart.destroy();
    if (this.polarChart) this.polarChart.destroy();
  }
}
