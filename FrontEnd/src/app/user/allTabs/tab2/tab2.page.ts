import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NumberService } from 'src/services/number/number.service';
import { TokenService } from 'src/services/token/token.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],

})

export class Tab2Page {

  alertButtons = ['Close'];
  public confrimationButtons = [
    {
      text: 'Cancelar',
      role: 'cancel',
      handler: () => {
        console.log('Alert canceled');
      },
    },
    {
      text: 'Enviar',
      role: 'confirm',
      handler: () => {
        console.log('Alert confirmed');
        this.sendNumber()
      },
    },
  ];
  todayDate: string = ""
  inputNumber: any
  dialogMessage: any;
  header: any;
  subheader: any;
  message: any;
  isAlertOpen: any;

  constructor(private numberService: NumberService, private router: Router, private tokenService: TokenService) {

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    var monthText;

    switch (mm) {
      case "01":
        monthText = "Enero";
        break;
      case "02":
        monthText = "Febrero";
        break;
      case "03":
        monthText = "Marzo";
        break;
      case "04":
        monthText = "Abril";
        break;
      case "05":
        monthText = "Mayo";
        break;
      case "06":
        monthText = "Junio";
        break;
      case "07":
        monthText = "Julio";
        break;
      case "08":
        monthText = "Agosto";
        break;
      case "09":
        monthText = "Septiembre";
        break;
      case "10":
        monthText = "Octubre";
        break;
      case "11":
        monthText = "Noviembre";
        break;
      case "12":
        monthText = "Diciembre";
        break;
      default:
        monthText = "Mes desconocido";
        break;
    }

    this.todayDate = dd + ' de ' + monthText + ' de ' + yyyy;
  }

  /**
   * Set the text to the dialog when a user wants to send a number
   */
  openDialog() {
    this.header = "!Cuidadin!"
    this.subheader = "El numero selecionado es el " + this.inputNumber
    this.message = "¿Estas segur@ que ese es tu número?"
  }

  /**
   * Send the number to the API
   */
  sendNumber() {

    const regex = /^([1-9]|[1-9]\d)$/;

    if (regex.test(this.inputNumber)) {
      console.log('El número es un número natural entre 1 y 99');

      this.numberService.requestSendNumber(this.inputNumber).then((response: any) => {

        this.header = "SUUUUUUUU!"
        this.subheader = "Numero guardado correctamente"
        this.message = ""

      }).catch((error: any) => {

        console.log(error)

        if (error.status == 469) {
          this.header = "A donde vas, espabilad@"
          this.subheader = "Ya has enviado un numero hoy"
          this.message = "Solo se permite guardar un número por dia."
        } else {
          this.header = "UPS!"
          this.subheader = "Algo ha ido mal"
          this.message = "Contacta con algun administrador para mas informacion " + error.status
        }

        this.isAlertOpen = true;

      })

    } else {
      console.log('El número no es un número natural entre 1 y 99');

      this.header = "A donde vas, espabilad@"
      this.subheader = "El numero tiene que estar entre el 1 y el 99"
      this.message = "Atent@ a las instruciones"

      this.isAlertOpen = true;

    }

  }

  /**
   * Set the dialog open or not
   * @param isOpen 
   */
  setOpen(isOpen: boolean) {
    this.isAlertOpen = isOpen;
    if (!this.isAlertOpen) {
      this.header = ""
      this.subheader = ""
      this.message = ""
    }
  }

}
