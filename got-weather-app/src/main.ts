import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { CreateComponent } from './app/create/create.component';  // Updated to import CreateComponent
import { WeatherComponent } from './app/weather.component';
import { provideHttpClient } from '@angular/common/http';

const routes: Routes = [
  { path: 'home', component: WeatherComponent },
  { path: 'create-account', component: CreateComponent },  // Updated from LoginComponent
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
}).catch(err => console.error(err));
