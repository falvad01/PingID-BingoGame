import { Component, OnInit } from '@angular/core';
import lottie from 'lottie-web';


@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.scss'],
})
export class AdminMenuComponent  implements OnInit {

  constructor() { }

  ngOnInit() {

    lottie.loadAnimation({
      container: document.getElementById('lottie') as HTMLElement,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '../../../assets/admin_animation.json' // Ruta al archivo Lottie
    });
  }

}
