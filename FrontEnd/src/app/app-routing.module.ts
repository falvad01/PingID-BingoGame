import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AdminMainPage } from './admin/admin-main/admin-main.page';
import { IonicAppPage } from './user/ionic-app/ionic-app.page';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    redirectTo: 'admin/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component :IonicAppPage,
    loadChildren: () => import('./user/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: '',
    component :IonicAppPage,
    loadChildren: () => import('./user/allTabs/tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'admin/login',
    loadChildren: () => import('./admin/admin-login/admin-login.module').then(m => m.AdminLoginPageModule)
  },
  {
    path: 'admin',
    component: AdminMainPage,
    loadChildren: () => import('./admin/admin-main/admin-main.module').then(m => m.AdminMainPageModule)
  },
  {
    path: 'ionic-app',
    loadChildren: () => import('./user/ionic-app/ionic-app.module').then( m => m.IonicAppPageModule)
  },

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
