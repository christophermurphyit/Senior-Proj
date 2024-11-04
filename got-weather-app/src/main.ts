import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { LoginComponent } from './app/login/login.component';
import { WeatherComponent } from './app/weather.component';
import { provideHttpClient } from '@angular/common/http';

const routes: Routes = [
  { path: 'home', component: WeatherComponent },  // Main page for your app
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' }  // Redirect root to /home
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
}).catch(err => console.error(err));
