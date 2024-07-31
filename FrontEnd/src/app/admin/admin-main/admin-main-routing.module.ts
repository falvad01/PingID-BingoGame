import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminMainPage } from './admin-main.page';
import { AdminDashboardComponent } from '../admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from '../admin-users/admin-users.component';

const routes: Routes = [
  {
    path: '',
    component: AdminMainPage
  },
  {
    path: "main",
    component: AdminDashboardComponent
  },
  {
    path: "users",
    component: AdminUsersComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminMainPageRoutingModule {}
