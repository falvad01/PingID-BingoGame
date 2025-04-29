import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NumberService } from 'src/services/number/number.service';
import { ComunicationService } from 'src/services/user/comunication-service.service';
declare var $: any; // jQuery

enum STATUS {
  IDLE,
  PREPARATION,
  SENDED,
  ERROR
}

@Component({
  selector: 'app-new-number',
  templateUrl: './new-number.component.html',
  styleUrls: ['./new-number.component.scss'],
})

export class NewNumberComponent implements OnInit {
  closeModal() {
    this.showModal = false;
  }

  status: STATUS = STATUS.IDLE
  todayDate: string = '';
  inputNumber: any;
  header: string = '';
  subheader: string = '';
  message: string = '';
  showModal: any;


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
   * Set the text to the dialog when a user wants to send a number
   */
  openDialog() {
    console.log("openDialog")
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
    console.log("sendNumber")
    if (this.status == STATUS.PREPARATION) {
      const regex = /^([1-9]|[1-9]\d)$/;

      if (regex.test(this.inputNumber)) {
        console.log('El número es un número natural entre 1 y 99');
        this.numberService.requestSendNumber(this.inputNumber).then((response: any) => {
          this.status = STATUS.SENDED
          this.header = '¡SUUUUUUUU!';
          this.subheader = 'Número guardado correctamente';
          this.message = '';


        }).catch((error: any) => {
          console.log(error);
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
        console.log('El número no es un número natural entre 1 y 99');
        this.header = 'A donde vas, espabilad@';
        this.subheader = 'El número tiene que estar entre el 1 y el 99';
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
    console.log(this.status)

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
}
