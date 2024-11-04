import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeatherComponent } from './weather.component';
import { FooterComponent } from './footer.component';
import { HamburgerMenuComponent } from './hamburger-menu/hamburger-menu.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WeatherComponent, FooterComponent, HamburgerMenuComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'got-weather-app';
}
