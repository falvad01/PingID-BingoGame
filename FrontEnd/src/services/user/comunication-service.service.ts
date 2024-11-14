import { EventEmitter, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComunicationService {
  numberChanged: EventEmitter<boolean> = new EventEmitter();
  constructor() {}
  emitNumberChange(numberChanged: boolean) {
    this.numberChanged.emit(numberChanged)
  }
  getNumberChanged() {
    return this.numberChanged;
  }
}