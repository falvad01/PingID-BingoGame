import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/guard/user/auth.guard';
import { LoginPage } from './login/login.page';
import { MainUserPage } from './user/main-user/main-user.page';

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
  // {
  //   path: '/admin/',
  //   canActivate: [AuthGuardAdmin],
  //   loadChildren: () => import('./user/main-user/main-user.module').then(m => m.MainUserPageModule)

  // },


];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})


export class AppRoutingModule { }
