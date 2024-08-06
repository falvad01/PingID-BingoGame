import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainUserPage } from './main-user.page';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { IndividualTableComponent } from '../individual-table/individual-table.component';
import { NewNumberComponent } from '../new-number/new-number.component';
import { ClasificationComponent } from '../clasification/clasification.component';


const routes: Routes = [

  {
    path: '',
    component: MainUserPage,
    children:[
      {
        path: 'dashboard',
        component : DashboardComponent
      },
    
      {
        path: "number",
        component: NewNumberComponent
      },
      {
        path: "clasification",
        component: ClasificationComponent
      }
    ]

  }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainUserPageRoutingModule {}
