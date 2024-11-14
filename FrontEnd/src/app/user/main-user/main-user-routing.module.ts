import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainUserPage } from './main-user.page';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { IndividualTableComponent } from '../individual-table/individual-table.component';
import { NewNumberComponent } from '../new-number/new-number.component';
import { ClasificationComponent } from '../clasification/clasification.component';
import { EditProfileComponent } from '../edit-profile/edit-profile.component'
import { DataComponent } from '../data/data.component';
import { firstNumberGuard } from 'src/guard/user/first-number.guard';


const routes: Routes = [

  {
    path: '',
    component: MainUserPage,
    children:[
      {
        path: 'dashboard',
        component : DashboardComponent,
        canActivate: [firstNumberGuard]
      },
      {
        path: "number",
        component: NewNumberComponent
      },
      {
        path: "clasification",
        component: ClasificationComponent
      },
      {
        path: "edit",
        component: EditProfileComponent
      }
      ,
      {
        path: "data",
        component: DataComponent,
        canActivate: [firstNumberGuard]
      }
    ]

  }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainUserPageRoutingModule {}
