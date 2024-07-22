import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from 'src/services/token.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(private router: Router, private tokenService: TokenService) {

    if (!tokenService.isLogged()) {

      this.router.navigate(['/login']);

    }

  }

}
