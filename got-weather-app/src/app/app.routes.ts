import { Routes } from '@angular/router';
import { WeatherComponent } from './weather.component';
import { CreateComponent } from './create/create.component';
import { LoginComponent } from './login/login.component';
import { AccountInfoComponent } from './account-info/account-info.component';


export const routes: Routes = [
    { path: 'home', component: WeatherComponent },
    { path: 'create-account', component: CreateComponent },
    { path: 'login', component: LoginComponent },
    { path: 'account', component: AccountInfoComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' }
  ];
