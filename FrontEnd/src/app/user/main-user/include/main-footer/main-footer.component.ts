import { Component } from '@angular/core';
import packageJson from '../../../../../../package.json';

@Component({
  selector: 'app-main-footer',
  templateUrl: './main-footer.component.html',
  styleUrls: ['./main-footer.component.scss']
})
export class MainFooterComponent {
  public version: string = packageJson.version;
}
