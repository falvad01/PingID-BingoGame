import { Component, OnInit } from '@angular/core';
import { NumberService } from 'src/services/number/number.service';
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

  status: STATUS = STATUS.IDLE
  todayDate: string = '';
  inputNumber: any;
  header: string = '';
  subheader: string = '';
  message: string = '';


  constructor(private numberService: NumberService) { }

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
    this.status = STATUS.PREPARATION
    this.header = '¡Cuidadin!';
    this.subheader = `El número seleccionado es el ${this.inputNumber}`;
    this.message = '¿Estás segur@ que ese es tu número?';
  }

  /**
   * Send the number to the API
   */
  sendNumber(): void {

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
      $('#confirmationModal').modal('hide'); // Cerrar el modal después de confirmar



    } else if (this.status == STATUS.ERROR) {
      this.status = STATUS.IDLE
      $('#confirmationModal').modal('hide'); // Cerrar el modal después de confirmar

    }

  }
}
