import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer.component';
import { WeatherService } from './weather.service';
import { HamburgerMenuComponent } from './hamburger-menu/hamburger-menu.component';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'weather',
  standalone: true,
  imports: [CommonModule, FooterComponent, HamburgerMenuComponent],
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css'],
})
export class WeatherComponent implements OnInit {
  // Display + logic fields
  temp: string = '';
  city: string = '';            // The GoT city
  realCityName: string = '';    // The actual city from weatherData.name
  description: string = '';
  imageClass: string = '';
  public localTime: string = '';
  private cityTimezoneOffset: number = 0;
  username: string | null = null;

  // Forecast
  forecastData: any[] = [];
  dailyForecast: any;
  windSpeed: number | null = null;

  // Current/7day/daily signal
  private _selectedSignal: 'current' | '7day' | 'daily' = 'current';

  // Fahrenheit/Celsius
  private _unit: 'Fahrenheit' | 'Celsius' = 'Fahrenheit';
  selectedUnit: 'Fahrenheit' | 'Celsius' = 'Fahrenheit';

  // OpenWeather apiKey
  //private readonly apiKey = 'd474509725247f01f4f5b322d067dd8b';
  //private readonly apiUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(
    private http: HttpClient,
    private weatherService: WeatherService,
    private router: Router,
    private authService: AuthService
  ) {}

  @ViewChild(HamburgerMenuComponent) hamburgerMenu!: HamburgerMenuComponent;

  ngOnInit(): void {


    this.isLoggedIn = this.authService.isAuthenticated();
    // Grab the current user if logged in
    this.username = this.authService.getCurrentUser();

    // Attempt geolocation
    this.checkLocationPermission();

    // Update local time every second
    setInterval(() => {
      const now = new Date();
      const cityTime = new Date(
        now.getTime() + (this.cityTimezoneOffset + now.getTimezoneOffset() * 60) * 1000
      );
      this.localTime = `Location Time: ${cityTime.toLocaleString('en-US', { hour12: true })}`;
    }, 1000);
  }

  // ================================
  // 1) Geolocation
  // ================================
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
    console.log('Fetching weather data for location:', latitude, longitude);

    // Current weather — now handled by backend using lat/lon
    this.http
      .get<any>(`/api/weather?lat=${latitude}&lon=${longitude}`)
      .subscribe({
        next: (data) => {
          console.log('Weather data received:', data);
          this.windSpeed = Math.round(data.wind?.speed);

          // Pass to your GoT logic + store real city
          this.renderDOM(data);

          // Also store realCityName in DB if user is logged in
          this.updateUserLocationInDB(data.name);
        },
        error: () => {
          alert('Error fetching weather data. Please try again later.');
        },
      });

    // 7-day forecast from backend (includes daily + hourly)
    this.weatherService.get7DayForecast(latitude, longitude).subscribe({
      next: (forecastData: any) => {
        this.forecastData = forecastData.daily;

        if (forecastData.hourly && forecastData.hourly.length > 0) {
          this.dailyForecast = {
            morning: forecastData.hourly.find((hour: any) => new Date(hour.dt * 1000).getHours() === 7),
            noon: forecastData.hourly.find((hour: any) => new Date(hour.dt * 1000).getHours() === 12),
            afternoon: forecastData.hourly.find((hour: any) => new Date(hour.dt * 1000).getHours() === 17),
          };
        }
      },
      error: (err) => {
        console.error('Error fetching forecast:', err);
        alert('Error fetching forecast data. Please try again later.');
      },
    });
  }


  // ================================
  // 2) Searching city by name
  // ================================
  searchCity(cityName: string): void {
    this.selectedUnit = 'Fahrenheit';
    if (this.hamburgerMenu) {
      this.hamburgerMenu.setUnit('Fahrenheit');
    }
    console.log('Searching city:', cityName);

    // Step 1: Fetch current weather from backend
    this.http.get<any>(`/api/weather?city=${cityName}`).subscribe({
      next: (data) => {
        console.log('Current Weather Data:', data);
        this.windSpeed = Math.round(data.wind?.speed);

        // GoT rendering + update location
        this.renderDOM(data);
        this.updateUserLocationInDB(data.name);

        // Step 2: Extract lat/lon and use once for both forecasts
        //const { lat, lon } = data.coord;
        const coord = data.coord;

    if (!coord || coord.lat === undefined || coord.lon === undefined) {
      console.error('Missing coordinates from weather API response:', coord);
      alert('Could not determine forecast location.');
      return;
    }

    const lat = coord.lat;
    const lon = coord.lon;
    console.log('Using coordinates for forecast:', lat, lon);

        // 7-day forecast
        this.weatherService.get7DayForecast(lat, lon).subscribe({
          next: (forecastData: any) => {
            this.forecastData = forecastData.daily;

            // Daily forecast (hourly breakdown)
            if (forecastData.hourly && forecastData.hourly.length > 0) {
              this.dailyForecast = {
                morning: forecastData.hourly.find((hour: any) => new Date(hour.dt * 1000).getHours() === 7),
                noon: forecastData.hourly.find((hour: any) => new Date(hour.dt * 1000).getHours() === 12),
                afternoon: forecastData.hourly.find((hour: any) => new Date(hour.dt * 1000).getHours() === 17),
              };
            }
          },
          error: (err) => {
            console.error('Error fetching forecast:', err);
            alert('Error fetching forecast data. Please try again later.');
          },
        });
      },
      error: (err) => {
        console.error('Error fetching current weather:', err);
        alert('City not found. Please try a different city.');
      },
    });
  }


  // On enter in the search box
  onSearchKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.performSearch();
    }
  }

  // The “Search” button
  performSearch(): void {
    const searchInput = document.getElementById('city-search') as HTMLInputElement;
    if (!searchInput) return;
    const cityName = searchInput.value;
    if (cityName) {
      this.searchCity(cityName);
    }
  }

  // If user picks favorite location
  onFavoriteSearch(city: string): void {
    console.log('Searching weather for favorite location:', city);
    this.searchCity(city);
  }

  // ================================
  // 3) Store user_location in DB
  // ================================
  private updateUserLocationInDB(city: string) {
    if (!this.username) {
      console.log('No user logged in, skipping user_location update.');
      return;
    }
    this.http
      .put('/api/updateUserLocation', {
        usernameOrEmail: this.username,
        newLocation: city,
      })
      .subscribe({
        next: (response: any) => {
          console.log('User location updated in DB:', response.message);
        },
        error: (err) => {
          console.error('Error updating user location:', err);
        },
      });
  }

  // ================================
  // 4) Render + GOT logic
  // ================================
  private renderDOM(weatherData: any): void {
    console.log('Processing weather data:', weatherData);

    // Example: Convert to number
    const numericTemp = parseFloat(weatherData.main.temp);
    const conditions = weatherData.weather[0].main;

    // The real city name from OWM
    this.realCityName = weatherData.name;

    // The GOT city
    this.city = this.determineCity(numericTemp, conditions);

    // Example temp string
    this.temp = this.determineTempMessage(this.city, numericTemp, conditions);
    this.description = this.determineDescription(this.city);

    // For local time
    this.cityTimezoneOffset = weatherData.timezone || 0;

    console.log('realCityName:', this.realCityName);
    console.log('GoT city:', this.city);
    console.log('temp:', this.temp);
    console.log('description:', this.description);
  }

  private determineCity(temp: number, conditions: string): string {
    let gotCity = '';

    if (conditions === 'Rain' || conditions === 'Thunderstorm') {
      gotCity = "storm's end";
      this.imageClass = 'stormsend-bg';
    } else if (conditions === 'Mist' || conditions === 'Fog') {
      gotCity = 'north of the wall';
      this.imageClass = 'north-bg';
    } else if (temp <= 35) {
      gotCity = 'winterfell';
      this.imageClass = 'winterfell-bg';
    } else if (temp <= 55) {
      gotCity = 'riverrun';
      this.imageClass = 'riverrun-bg';
    } else if (temp <= 65) {
      gotCity = 'highgarden';
      this.imageClass = 'highgarden-bg';
    } else if (temp <= 72) {
      gotCity = 'kings landing';
      this.imageClass = 'kingslanding-bg';
    } else if (temp <= 78) {
      gotCity = "slaver's bay";
      this.imageClass = 'slaversbay-bg';
    } else if (temp <= 90) {
      gotCity = 'dorne';
      this.imageClass = 'dorne-bg';
    } else {
      gotCity = 'castle black';
      this.imageClass = 'castleblack-bg';
    }

    return gotCity;
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

  // ================================
  // Forecast signals
  // ================================
  get selectedSignal(): 'current' | '7day' | 'daily' {
    return this._selectedSignal;
  }
  set selectedSignal(value: 'current' | '7day' | 'daily') {
    this._selectedSignal = value;
    console.log('Selected Signal updated to:', this._selectedSignal);
  }
  onForecastChanged(view: 'current' | '7day' | 'daily') {
    this.selectedSignal = view;
  }
  updateSelectedSignal(signal: 'current' | '7day' | 'daily') {
    this.selectedSignal = signal;
  }

  // ================================
  // F/C unit switching
  // ================================
  get unit(): 'Fahrenheit' | 'Celsius' {
    return this._unit;
  }
  set unit(value: 'Fahrenheit' | 'Celsius') {
    this._unit = value;
    this.convertForecastDataToSelectedUnit();
    this.convertDailyForecastToSelectedUnit();
  }
  setTemperatureUnit(unit: 'Fahrenheit' | 'Celsius'): void {
    this.unit = unit;
  }
  get displayTemp(): string {
    const numericTemp = parseFloat(this.temp);
    const convertedTemp = this.unit === 'Fahrenheit' ? numericTemp : this.convertToCelsius(numericTemp);
    const unitSymbol = this.unit === 'Fahrenheit' ? '°F' : '°C';
    return isNaN(convertedTemp) ? 'Huh?' : `${Math.round(convertedTemp)} ${unitSymbol}`;
  }

  convertForecastDataToSelectedUnit(): void {
    if (!this.forecastData || this.forecastData.length === 0) return;
    // same logic as your code
  }
  convertDailyForecastToSelectedUnit(): void {
    if (!this.dailyForecast) return;
    // same logic
  }
  private convertToCelsius(tempF: number): number {
    return ((tempF - 32) * 5) / 9;
  }
}
