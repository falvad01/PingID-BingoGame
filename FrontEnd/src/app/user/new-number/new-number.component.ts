import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NumberService } from 'src/services/number/number.service';
import { ComunicationService } from 'src/services/user/comunication-service.service';
declare var $: any; // jQuery

enum STATUS {
  IDLE = 0,
  PREPARATION = 1,
  SENDED = 2,
  ERROR = 3
}

@Component({
  selector: 'app-new-number',
  templateUrl: './new-number.component.html',
  styleUrls: ['./new-number.component.scss'],
})

export class NewNumberComponent implements OnInit {

  status: STATUS = STATUS.IDLE
  todayDate: string = '';
  inputNumber: any;
  header: string = '';
  subheader: string = '';
  message: string = '';
  showModal: boolean = false;
  sending: boolean = false; // Flag to prevent multiple submissions


  constructor(private numberService: NumberService, private router: Router, private comunicationService: ComunicationService) { }

  ngOnInit(): void {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    this.todayDate = `${dd} de ${months[parseInt(mm) - 1]} de ${yyyy}`;
  }

  /**
   * Add a digit to the current number
   */
  addDigit(digit: number): void {
    const currentValue = this.inputNumber ? String(this.inputNumber) : '';

    // Limit to 2 digits
    if (currentValue.length >= 2) {
      return;
    }

    const newValue = currentValue + String(digit);
    const numValue = parseInt(newValue, 10);

    // Only update if it results in a valid number (0-99 for intermediate steps, but final must be 10-99)
    if (numValue <= 99) {
      this.inputNumber = numValue;
    }
  }

  /**
   * Clear the current number
   */
  clearNumber(): void {
    this.inputNumber = null;
  }

  /**
   * Check if current number is valid
   */
  isValidNumber(): boolean {
    if (!this.inputNumber) return false;
    const num = parseInt(this.inputNumber, 10);
    return num >= 10 && num <= 99;
  }

  closeModal(): void {
    this.showModal = false;
    this.status = STATUS.IDLE;
  }

  /**
   * Set the text to the dialog when a user wants to send a number
   */
  openDialog(): void {
    if (!this.isValidNumber()) {
      return;
    }

    console.info("openDialog")
    this.showModal = true;
    this.status = STATUS.PREPARATION
    this.header = '¡Cuidadin!';
    this.subheader = `El número seleccionado es el ${this.inputNumber}`;
    this.message = '¿Estás segur@ que ese es tu número?';
  }

  /**
   * Send the number to the API
   */
  sendNumber(): void {
    console.info("sendNumber")
    if (this.status == STATUS.PREPARATION) {
      // Prevent multiple submissions
      if (this.sending) {
        return;
      }

      const regex = /^[1-9]\d$/;

      if (regex.test(this.inputNumber)) {
        console.info('El número es un número natural entre 10 y 99');
        this.sending = true; // Set flag to prevent multiple clicks

        this.numberService.requestSendNumber(this.inputNumber).then((response: any) => {
          this.sending = false;
          this.status = STATUS.SENDED
          this.header = '¡SUUUUUUUU!';
          this.subheader = 'Número guardado correctamente';
          this.message = '';


        }).catch((error: any) => {
          this.sending = false;
          console.info(error);
          if (error.status == 469) {
            this.status = STATUS.ERROR
            this.header = 'A donde vas, espabilad@';
            this.subheader = 'Ya has enviado un número hoy';
            this.message = 'Solo se permite guardar un número por día.';
          } else {
            this.status = STATUS.ERROR
            this.header = 'UPS!';
            this.subheader = 'Algo ha ido mal';
            this.message = `Contacta con algún administrador para más información. Error ${error.status}`;
          }
        });
      } else {
        console.info('El número no es un número natural entre 10 y 99');
        this.status = STATUS.ERROR
        this.header = 'A donde vas, espabilad@';
        this.subheader = 'El número tiene que estar entre el 10 y el 99';
        this.message = 'Atent@ a las instrucciones';
      }

    } else if (this.status == STATUS.SENDED) {
      this.status = STATUS.IDLE
      this.showModal = false
      this.comunicationService.emitNumberChange(true);
      this.router.navigate(["user/dashboard"])


    } else if (this.status == STATUS.ERROR) {
      this.status = STATUS.IDLE
      this.showModal = false
    }
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    console.info(this.status)

    if (this.inputNumber) {
      if (this.status == STATUS.PREPARATION) {
        this.sendNumber();
      } else if (this.status == STATUS.IDLE) {
        this.openDialog();
      } else if (this.status == STATUS.ERROR) {
        this.status = STATUS.IDLE
        this.showModal = false
      } else if (this.status == STATUS.SENDED) {
        this.status = STATUS.IDLE
        this.showModal = false
        this.comunicationService.emitNumberChange(true);
        this.router.navigate(["user/dashboard"])
      }

    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    // Handle numeric keys (0-9)
    if (event.key >= '0' && event.key <= '9' && this.status === STATUS.IDLE) {
      this.addDigit(parseInt(event.key, 10));
      event.preventDefault();
    }

    // Handle backspace
    if (event.key === 'Backspace' && this.status === STATUS.IDLE) {
      this.clearNumber();
      event.preventDefault();
    }
  }
}

