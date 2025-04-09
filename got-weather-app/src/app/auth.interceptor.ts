import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken(); //Get the token from your service

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}` //Attach the token to every request
        }
      });
    }

    return next.handle(request);
  }
}

