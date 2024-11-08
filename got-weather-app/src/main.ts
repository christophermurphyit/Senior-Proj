import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { CreateComponent } from './app/create/create.component';  // Import CreateComponent
import { WeatherComponent } from './app/weather.component';  // Import WeatherComponent
import { provideHttpClient } from '@angular/common/http';

const routes: Routes = [
  { path: 'home', component: WeatherComponent},  // Main page for your app
  { path: 'create-account', component: CreateComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' }  // Redirect root to /home
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient()  // Provides HttpClient globally
  ]
}).catch(err => console.error(err));
