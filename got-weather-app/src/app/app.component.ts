import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponenet } from "./header.component";
import { WeatherComponenet } from './weather.component';
import { FooterComponenet } from './footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponenet, WeatherComponenet, FooterComponenet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'got-weather-app';
}
