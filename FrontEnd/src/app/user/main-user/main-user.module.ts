import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MainUserPageRoutingModule } from './main-user-routing.module';
import { MainHeaderComponent } from './include/main-header/main-header.component';
import { MainMenuComponent } from './include/main-menu/main-menu.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { IndividualTableComponent } from '../individual-table/individual-table.component';
import { MainFooterComponent } from './include/main-footer/main-footer.component';
import { NumberStadisticsComponent } from '../number-stadistics/number-stadistics.component';
import { NumberTableComponent } from '../number-table/number-table.component';
import { MainUserPage } from './main-user.page';
import { NumberBarChartComponent } from '../number-bar-chart/number-bar-graph.component';
import { TooltipModule } from 'primeng/tooltip';
import { ClasificationChartComponent } from "../clasification-chart/clasification-chart.component";
import { NumbersTimeLineComponent } from "../numbers-time-line/numbers-time-line.component";
import { EditProfileComponent } from 'src/app/user/edit-profile/edit-profile.component';



@NgModule({
  imports: [
    CommonModule,
    MainUserPageRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TooltipModule,
    ClasificationChartComponent,
    NumbersTimeLineComponent,
],
  declarations: [
    MainUserPage,
    MainHeaderComponent,
    MainMenuComponent,
    MainHeaderComponent,
    DashboardComponent,
    IndividualTableComponent,
    MainFooterComponent,
    NumberStadisticsComponent,
    NumberTableComponent,
    NumberBarChartComponent,
    EditProfileComponent

  ],

})

export class MainUserPageModule { }
