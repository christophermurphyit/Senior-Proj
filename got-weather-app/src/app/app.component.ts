import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeatherComponenet } from './weather.component';
import { FooterComponenet } from './footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WeatherComponenet, FooterComponenet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'got-weather-app';
}
