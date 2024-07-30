import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminMainPage } from './admin-main.page';
import { AdminDashboardComponent } from '../admin-dashboard/admin-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: AdminMainPage
  },
  {
    path: "main",
    component: AdminDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminMainPageRoutingModule {}
