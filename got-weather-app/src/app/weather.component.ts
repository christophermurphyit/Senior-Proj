import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { FooterComponent } from './footer.component';
import { HamburgerMenuComponent } from './hamburger-menu/hamburger-menu.component';

@Component({
  selector: 'weather',
  standalone: true,
  imports: [CommonModule, FooterComponent, HamburgerMenuComponent], // Add CommonModule here
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css'],
})
export class WeatherComponent implements OnInit {
  temp: string = '';
  city: string = '';
  description: string = '';
  imageClass: string = '';

  private readonly apiKey = 'd474509725247f01f4f5b322d067dd8b';
  private readonly apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.checkLocationPermission();
  }

  private checkLocationPermission(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.getCurrentWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          alert('Please enable location in device and browser settings to get local weather.');
        }
      );
    }
  }

  private getCurrentWeather(latitude: number, longitude: number): void {
    console.log('Fetching weather data for location:', latitude, longitude); // Log to confirm coordinates
    this.http
      .get(`${this.apiUrl}?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=imperial`)
      .subscribe({
        next: (data: any) => {
          console.log('Weather data received:', data); // Log to confirm data is received
          this.renderDOM(data);
        },
        error: () => alert('Error fetching weather data. Please try again later.'),
      });
  }

  searchCity(cityName: string): void {
    this.http
      .get(`${this.apiUrl}?q=${cityName}&appid=${this.apiKey}&units=imperial`)
      .subscribe({
        next: (data: any) => this.renderDOM(data),
        error: () => alert('City not found. Please try a different city.'),
      });
  }

  private renderDOM(weatherData: any): void {
    console.log('Processing weather data:', weatherData); // Log the weather data
    const temp = weatherData.main.temp.toFixed();
    const conditions = weatherData.weather[0].main;

    this.city = this.determineCity(temp, conditions);
    this.temp = this.determineTempMessage(this.city, temp, conditions);
    this.description = this.determineDescription(this.city);

    console.log('Updated city:', this.city);
    console.log('Updated temp:', this.temp);
    console.log('Updated description:', this.description);
  }

  private determineCity(temp: number, conditions: string): string {
    let city = '';

    if (conditions === 'Rain' || conditions === 'Thunderstorm') {
      city = "storm's end";
      this.imageClass = 'stormsend-bg';
    } else if (conditions === 'Mist' || conditions === 'Fog') {
      city = 'north of the wall';
      this.imageClass = 'north-bg';
    } else if (temp <= 35) {
      city = 'winterfell';
      this.imageClass = 'winterfell-bg';
    } else if (temp <= 55) {
      city = 'riverrun';
      this.imageClass = 'riverrun-bg';
    } else if (temp <= 65) {
      city = 'highgarden';
      this.imageClass = 'highgarden-bg';
    } else if (temp <= 72) {
      city = 'kings landing';
      this.imageClass = 'kingslanding-bg';
    } else if (temp <= 78) {
      city = "slaver's bay";
      this.imageClass = 'slaversbay-bg';
    } else if (temp <= 90) {
      city = 'dorne';
      this.imageClass = 'dorne-bg';
    } else {
      city = 'castle black';
      this.imageClass = 'castleblack-bg';
    }

    return city;
  }

  private determineTempMessage(city: string, temp: number, conditions: string): string {
    return `${temp}°F, ${conditions}`;
  }

  private determineDescription(city: string): string {
    const descriptions: Record<string, string> = {
      "storm's end": "Storm's end known for impenetrable walls and stormy weather.",
      'north of the wall': "Foggy out there. Watch out for White Walkers.",
      winterfell: 'Cold, Icy, Freezing. Home of the Starks.',
      riverrun: 'River-crossed fortress with lush, fertile lands.',
      highgarden: 'Verdant, prosperous castle amid fertile, blooming lands.',
      "kings landing": 'Sprawling coastal city and seat of royal power.',
      "slaver's bay": 'Harsh, arid coastal region with waves of heat.',
      dorne: 'Sun-soaked desert land with fierce, proud people.',
      'castle black': 'Last bastion of civilization before the wilds',
    };
    return descriptions[city.toLowerCase()] || '';
  }

  onSearchKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.performSearch();
    }
  }

  performSearch(): void {
    const searchInput = (document.getElementById('city-search') as HTMLInputElement).value;
    if (searchInput) {
      this.searchCity(searchInput);
    }
  }

  onFavoriteSearch(city: string): void {
    // Handle the favorite search
    console.log('Searching weather for favorite location:', city);
    this.searchCity(city);
  }

  // Private property to track unit internally
  private _unit: 'Fahrenheit' | 'Celsius' = 'Fahrenheit'; // Default unit

  // Getter for the unit
  get unit(): 'Fahrenheit' | 'Celsius' {
    return this._unit;
  }

  // Setter for the unit to update temperature display
  set unit(value: 'Fahrenheit' | 'Celsius') {
    this._unit = value;
  }

  // Method to set temperature unit and update display without exposing unit as a property
  setTemperatureUnit(unit: 'Fahrenheit' | 'Celsius'): void {
    this.unit = unit; // Use setter
  }

  // Helper function to display temperature with the correct unit
  get displayTemp(): string {
    const numericTemp = parseFloat(this.temp);
    const formattedTemp = this.unit === 'Fahrenheit' ? numericTemp : this.convertToCelsius(numericTemp);
    const unitSymbol = this.unit === 'Fahrenheit' ? '°F' : '°C';
    return isNaN(formattedTemp) ? 'Huh?' : `${Math.round(formattedTemp)} ${unitSymbol}`;
  }

  // Helper function to convert Fahrenheit to Celsius
  private convertToCelsius(tempFahrenheit: number): number {
    return ((tempFahrenheit - 32) * 5) / 9;
  }
}
