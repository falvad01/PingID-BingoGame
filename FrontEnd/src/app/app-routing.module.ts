import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/guard/user/auth.guard';
import { LoginPage } from './login/login.page';
import { MainUserPage } from './user/main-user/main-user.page';
import { firstNumberGuard } from 'src/guard/user/first-number.guard';
import { authAdminGuard } from './guard/admin/auth-admin.guard';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { SeasonManagementComponent } from './admin/season-management/season-management.component';
import { UserManagementComponent } from './admin/user-management/user-management.component';
import { NumberManagementComponent } from './admin/number-management/number-management.component';
import { ExtensionManagerComponent } from './admin/extension-manager/extension-manager.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginPage
  },
  {
    path: 'user',
    canActivate: [AuthGuard],
    loadChildren: () => import('./user/main-user/main-user.module').then(m => m.MainUserPageModule)
  },
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [authAdminGuard]
  },
  {
    path: 'admin/seasons',
    component: SeasonManagementComponent,
    canActivate: [authAdminGuard]
  },
  {
    path: 'admin/users',
    component: UserManagementComponent,
    canActivate: [authAdminGuard]
  },
  {
    path: 'admin/numbers',
    component: NumberManagementComponent,
    canActivate: [authAdminGuard]
  },
  {
    path: 'admin/extension',
    component: ExtensionManagerComponent,
    canActivate: [authAdminGuard]
  },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})


export class AppRoutingModule { }

