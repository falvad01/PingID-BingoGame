import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NumberService } from 'src/services/number/number.service';

interface FunStat {
  icon: string;
  label: string;
  value: string | number;
  subtitle: string;
  colorClass: string;
}

@Component({
  selector: 'app-fun-stats-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fun-stats-cards.component.html',
  styleUrls: ['./fun-stats-cards.component.scss']
})
export class FunStatsCardsComponent implements OnInit {
  stats: FunStat[] = [];
  loading = true;

  constructor(private numberService: NumberService) { }

  ngOnInit() {
    this.loadStats();
  }

  private async loadStats() {
    try {
      const response = await this.numberService.retrieveAllNumbers() as any;

      // Handle new response structure { numbers: [...], metadata: {...} }
      // or old structure (just array)
      let allNumbers: any[];
      let metadata: any = null;

      if (response && response.numbers && Array.isArray(response.numbers)) {
        // New structure
        allNumbers = response.numbers;
        metadata = response.metadata || null;
      } else if (Array.isArray(response)) {
        // Old structure - just an array
        allNumbers = response;
      } else {
        console.error('Unexpected response format:', response);
        allNumbers = [];
      }

      // Filter to only include valid range (10-99)
      const validNumbers = allNumbers.filter((num: any) => num.number >= 10 && num.number <= 99);

      // Calculate statistics
      const hottestNumber = this.getHottestNumber(validNumbers);
      const coldestNumber = this.getColdestNumber(validNumbers);
      const totalEntries = this.getTotalEntries(validNumbers);
      const avgPerDay = this.getAveragePerDay(validNumbers, metadata);
      const evenVsOdd = this.getEvenVsOdd(validNumbers);
      const uniqueNumbers = this.getUniqueNumbersCount(validNumbers);

      this.stats = [
        {
          icon: 'fa-fire',
          label: 'Número más caliente',
          value: hottestNumber.number || '-',
          subtitle: `${hottestNumber.count || 0} veces`,
          colorClass: 'stat-hot'
        },
        {
          icon: 'fa-snowflake',
          label: 'Número más frío',
          value: coldestNumber.number || '-',
          subtitle: coldestNumber.subtitle || 'Sin datos',
          colorClass: 'stat-cold'
        },
        {
          icon: 'fa-hashtag',
          label: 'Total introducciones',
          value: totalEntries,
          subtitle: 'números introducidos',
          colorClass: 'stat-recent'
        },
        {
          icon: 'fa-chart-line',
          label: 'Media diaria',
          value: avgPerDay,
          subtitle: 'números/día activo',
          colorClass: 'stat-average'
        },
        {
          icon: 'fa-balance-scale',
          label: 'Pares/Impares',
          value: `${evenVsOdd.even}/${evenVsOdd.odd}`,
          subtitle: 'proporción',
          colorClass: 'stat-balance'
        },
        {
          icon: 'fa-star',
          label: 'Números únicos',
          value: uniqueNumbers,
          subtitle: 'de 90 posibles (10-99)',
          colorClass: 'stat-repeat'
        }
      ];

      this.loading = false;
    } catch (error) {
      console.error('Error loading stats:', error);
      this.loading = false;
    }
  }

  private getHottestNumber(numbers: any[]): { number: number | null, count: number } {
    if (!numbers || numbers.length === 0) return { number: null, count: 0 };

    const hottest = numbers.reduce((max, num) =>
      num.repetitions > max.repetitions ? num : max
    );

    return { number: hottest.number, count: hottest.repetitions };
  }

  private getColdestNumber(numbers: any[]): { number: number | null, subtitle: string } {
    if (!numbers || numbers.length === 0) return { number: null, subtitle: 'Sin datos' };

    // Find the valid number with least repetitions
    const coldest = numbers.reduce((min, num) =>
      num.repetitions < min.repetitions ? num : min
    );

    return {
      number: coldest.number,
      subtitle: `solo ${coldest.repetitions} ${coldest.repetitions === 1 ? 'vez' : 'veces'}`
    };
  }

  private getTotalEntries(numbers: any[]): number {
    if (!numbers || numbers.length === 0) return 0;

    return numbers.reduce((sum, num) => sum + num.repetitions, 0);
  }

  private getAveragePerDay(numbers: any[], metadata: any): string {
    if (!numbers || numbers.length === 0) return '0.0';

    const totalEntries = this.getTotalEntries(numbers);

    let activeDays = 1; // Default to 1 to avoid division by zero

    // Use metadata from backend if available
    if (metadata && metadata.totalActiveDays) {
      activeDays = metadata.totalActiveDays;
    } else {
      // Fallback: Calculate from dates if available in numbers
      const uniqueDates = new Set();
      numbers.forEach(num => {
        if (num.dates && Array.isArray(num.dates)) {
          num.dates.forEach((date: any) => {
            const dateOnly = new Date(date).toISOString().split('T')[0];
            uniqueDates.add(dateOnly);
          });
        }
      });

      if (uniqueDates.size > 0) {
        activeDays = uniqueDates.size;
      } else {
        // Last resort estimation
        const uniqueCount = numbers.length;
        activeDays = Math.max(Math.ceil(uniqueCount / 5), 1);
      }
    }

    const avg = totalEntries / activeDays;

    // Format the result
    if (avg < 10) {
      return avg.toFixed(1);
    }
    return Math.round(avg).toString();
  }

  private getEvenVsOdd(numbers: any[]): { even: number, odd: number } {
    if (!numbers || numbers.length === 0) return { even: 0, odd: 0 };

    let even = 0;
    let odd = 0;

    numbers.forEach(num => {
      if (num.number % 2 === 0) {
        even += num.repetitions; // Sum all entries, not unique count
      } else {
        odd += num.repetitions; // Sum all entries, not unique count
      }
    });

    return { even, odd };
  }

  private getUniqueNumbersCount(numbers: any[]): number {
    if (!numbers || numbers.length === 0) return 0;

    return numbers.length;
  }
}
