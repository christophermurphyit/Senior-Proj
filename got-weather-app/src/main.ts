import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { CreateComponent } from './app/create/create.component';  // Import CreateComponent
import { WeatherComponent } from './app/weather.component';  // Import WeatherComponent
import { provideHttpClient } from '@angular/common/http';

const routes: Routes = [
  { path: 'home', component: WeatherComponent },
  { path: 'create-account', component: CreateComponent },  // Route for Create Account
  { path: '', redirectTo: 'home', pathMatch: 'full' }  // Default route
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient()  // Provides HttpClient globally
  ]
}).catch(err => console.error(err));
