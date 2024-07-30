import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminMainPageRoutingModule } from './admin-main-routing.module';

import { AdminMainPage } from './admin-main.page';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { AdminMenuComponent } from '../admin-menu/admin-menu.component';
import { AdminFooterComponent } from '../admin-footer/admin-footer.component';
import { AdminDashboardComponent } from '../admin-dashboard/admin-dashboard.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminMainPageRoutingModule,
  ],
  declarations: [
    AdminMainPage,
    AdminHeaderComponent,
    AdminMenuComponent,
    AdminFooterComponent,
    AdminDashboardComponent
   
  ]
})
export class AdminMainPageModule { }
