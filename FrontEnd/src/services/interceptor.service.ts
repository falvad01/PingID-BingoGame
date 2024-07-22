
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {map, catchError} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import { SplashService } from './splash.service';


@Injectable({
  providedIn: 'root'
})
export class InterceptorService {
  /**
   * @param loader 
   */
  constructor(private loader: SplashService) {}

  //Interceptor will catch any API calls made by app here
  intercept(
    req: HttpRequest<any>, 
    next: HttpHandler
  ): Observable<HttpEvent<any>> 
  {
    return next.handle(req).pipe(
        map((event: HttpEvent<any>) => {
            return event;
        }),
        catchError((error: HttpErrorResponse) => {
            return throwError(error);
        })
    );
  }
}
