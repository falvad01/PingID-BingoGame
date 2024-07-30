import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IonicAppPage } from './ionic-app.page';

const routes: Routes = [
  {
    path: '',
    component: IonicAppPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IonicAppPageRoutingModule {}
