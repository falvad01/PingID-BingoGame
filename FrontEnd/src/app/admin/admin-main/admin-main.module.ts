import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminMainPageRoutingModule } from './admin-main-routing.module';

import { AdminMainPage } from './admin-main.page';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { AdminMenuComponent } from '../admin-menu/admin-menu.component';
import { AdminFooterComponent } from '../admin-footer/admin-footer.component';
import { AdminDashboardComponent } from '../admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from '../admin-users/admin-users.component';



@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    AdminMainPageRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    AdminMainPage,
    AdminHeaderComponent,
    AdminMenuComponent,
    AdminFooterComponent,
    AdminDashboardComponent,
    AdminUsersComponent

  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})

export class AdminMainPageModule { }
