import { Component, OnInit } from '@angular/core';
import { CountdownComponent, CountdownConfig } from 'ngx-countdown';
import { TokenService } from 'src/services/token/token.service';

const CountdownTimeUnits: Array<[string, number]> = [
  ['Y', 1000 * 60 * 60 * 24 * 365], // years
  ['M', 1000 * 60 * 60 * 24 * 30], // months
  ['D', 1000 * 60 * 60 * 24], // days
  ['H', 1000 * 60 * 60], // hours
  ['m', 1000 * 60], // minutes
  ['s', 1000], // seconds
  ['S', 1], // million seconds
];

@Component({
  selector: 'app-main-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss']
})
export class MainHeaderComponent implements OnInit {

  config!: CountdownConfig;

  constructor(private tokenService: TokenService) {}

  ngOnInit() {
    const now = new Date();
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59); // 31 de diciembre a las 23:59:59
    const leftTime = Math.floor((endOfYear.getTime() - now.getTime()) / 1000); // tiempo restante en segundos

    this.config = {
      leftTime: leftTime,
      format: 'DD HH:mm:ss',
      formatDate: ({ date, formatStr }) => {
        let duration = Number(date || 0);

        return CountdownTimeUnits.reduce((current: string, [name, unit]: any) => {
          if (current.indexOf(name) !== -1) {
            const v = Math.floor(duration / unit);
            duration -= v * unit;
            return current.replace(new RegExp(`${name}+`, 'g'), (match: string) => {
              // Cuando los días están vacíos
              if (name === 'D' && v <= 0) {
                return '';
              }
              return v.toString().padStart(match.length, '0');
            });
          }
          return current;
        }, formatStr);
      },
    };
  }

  logOut() {
    this.tokenService.closeSession();
  }

}
