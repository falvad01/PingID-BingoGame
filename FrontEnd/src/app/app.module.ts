import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SplashScreenComponent } from './splash-screen/splash-screen.component';

import { InterceptorService } from 'src/services/interceptor.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    SplashScreenComponent,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule],
  providers: [
  { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  { 
    provide: HTTP_INTERCEPTORS,
    useClass: InterceptorService,
    multi: true
  }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
