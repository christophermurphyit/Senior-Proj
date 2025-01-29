import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { FooterComponent } from './footer.component';
import { WeatherService } from './weather.service';
import { HamburgerMenuComponent } from './hamburger-menu/hamburger-menu.component';
import { AuthService } from './auth.service';

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
  realCityName: string = '';
  description: string = '';
  imageClass: string = '';
  public localTime: string = '';
  private timezoneOffset: number = 0;
  username: string | null = null;
  forecastData: any[] = []; //Array to store the 7-day forecast
  private _selectedSignal: 'current' | '7day' | 'daily' = 'current'; // Default signal
  selectedUnit: 'Fahrenheit' | 'Celsius' = 'Fahrenheit'; // Default to Fahrenheit
  dailyForecast: any;


  private readonly apiKey = 'd474509725247f01f4f5b322d067dd8b';
  private readonly apiUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(private http: HttpClient, private weatherService: WeatherService, private authService: AuthService) {}
  @ViewChild(HamburgerMenuComponent) hamburgerMenu!: HamburgerMenuComponent;


  ngOnInit(): void {
    this.username = this.authService.getCurrentUser();
    this.checkLocationPermission();

    setInterval(() => {
      const now = new Date();
      const cityTime = new Date(
        now.getTime() + (this.cityTimezoneOffset + now.getTimezoneOffset() * 60) * 1000
      );
      this.localTime = cityTime.toLocaleString('en-US', { hour12: true });
  }, 1000);
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
      .get(`${this.apiUrl}/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=imperial`)
      .subscribe({
        next: (data: any) => {
          console.log('Weather data received:', data); // Log to confirm data is received
          this.renderDOM(data);
        },
        error: () => alert('Error fetching weather data. Please try again later.'),
      });
      this.weatherService.get7DayForecast(latitude, longitude).subscribe({
        next: (forecastData: any) => {
          console.log('7-Day Forecast Data:', forecastData);
          this.forecastData = forecastData.daily;
        },
        error: (err) => console.error('Error fetching 7-day forecast:', err),
      });
      this.weatherService.get7DayForecast(latitude, longitude).subscribe({
        next: (forecastData: any) => {
          if (forecastData.hourly && forecastData.hourly.length > 0) {
            // Filter temperatures for 7 AM, 12 PM, and 5 PM
            this.dailyForecast = {
              morning: forecastData.hourly.find((hour: any) => new Date(hour.dt * 1000).getHours() === 7),
              noon: forecastData.hourly.find((hour: any) => new Date(hour.dt * 1000).getHours() === 12),
              afternoon: forecastData.hourly.find((hour: any) => new Date(hour.dt * 1000).getHours() === 17),

            };
            console.log('Daily Hourly Forecast Data:', this.dailyForecast);
          } else {
            console.error('No hourly forecast data found');
          }
        },
        error: (err) => {
          console.error('Error fetching daily forecast:', err);
          alert('Error fetching daily forecast. Please try again later.');
        },
      });
  }

  // Getter for selectedSignal
  get selectedSignal(): 'current' | '7day' | 'daily' {
    return this._selectedSignal;
  }

  // Setter for selectedSignal
  set selectedSignal(value: 'current' | '7day' | 'daily') {
    this._selectedSignal = value;
    console.log('Selected Signal updated to:', this._selectedSignal);
    // Trigger any additional logic you want when the signal changes
  }

  onForecastChanged(view: 'current' | '7day' | 'daily') {
    this.selectedSignal = view;
    console.log('Forecast view changed to:', this.selectedSignal);
  }

  updateSelectedSignal(signal: 'current' | '7day' | 'daily') {
    this.selectedSignal = signal; // Update the signal based on the menu
    console.log('Selected Signal Updated:', this.selectedSignal);
  }

  searchCity(cityName: string) {
    this.selectedUnit = 'Fahrenheit';
    if (this.hamburgerMenu) {
      this.hamburgerMenu.setUnit('Fahrenheit');
    }
      console.log(this.selectedSignal);
      this.http
        .get(`${this.apiUrl}/weather?q=${cityName}&appid=${this.apiKey}&units=imperial`)
        .subscribe({
          next: (data: any) => {
            console.log('Current Weather Data:', data);
            this.renderDOM(data);
          },
          error: (err) => {
            console.error('Error fetching current weather:', err);
            alert('City not found. Please try a different city.');
          },
        });
    this.http
        .get(`${this.apiUrl}/weather?q=${cityName}&appid=${this.apiKey}&units=imperial`)
        .subscribe({
          next: (data: any) => {
            console.log('Current Weather Data for 7-day forecast:', data);
            const lat = data.coord.lat;
            const lon = data.coord.lon;
            console.log(`Latitude: ${lat}, Longitude: ${lon}`);

            // Use WeatherService to fetch the 7-day forecast
            this.weatherService.get7DayForecast(lat, lon).subscribe({
              next: (forecastData: any) => {
                console.log('7-Day Forecast Data:', forecastData);
                this.forecastData = forecastData.daily;
              },
              error: (err) => console.error('Error fetching 7-day forecast:', err),
            });
          },
          error: (err) => {
            console.error('Error fetching current weather for 7-day forecast:', err);
          },
        });

        this.http
    .get(`${this.apiUrl}/weather?q=${cityName}&appid=${this.apiKey}&units=imperial`)
    .subscribe({
      next: (data: any) => {
        console.log('Current Weather Data:', data);

        // Get coordinates for hourly forecast
        const lat = data.coord.lat;
        const lon = data.coord.lon;
        console.log(`Latitude: ${lat}, Longitude: ${lon}`);

        // Use WeatherService to fetch hourly forecast using One Call API
        this.weatherService.get7DayForecast(lat, lon).subscribe({
          next: (forecastData: any) => {
            if (forecastData.hourly && forecastData.hourly.length > 0) {
              // Filter temperatures for 7 AM, 12 PM, and 5 PM
              this.dailyForecast = {
                morning: forecastData.hourly.find((hour: any) => new Date(hour.dt * 1000).getHours() === 7),
                noon: forecastData.hourly.find((hour: any) => new Date(hour.dt * 1000).getHours() === 12),
                afternoon: forecastData.hourly.find((hour: any) => new Date(hour.dt * 1000).getHours() === 17),

              };
              console.log('Daily Hourly Forecast Data:', this.dailyForecast);
            } else {
              console.error('No hourly forecast data found');
            }
          },
          error: (err) => {
            console.error('Error fetching daily forecast:', err);
            alert('Error fetching daily forecast. Please try again later.');
          },
        });
      },
      error: (err) => {
        console.error('Error fetching current weather for daily forecast:', err);
      },
    });
  
  }
  

  private renderDOM(weatherData: any): void {
    console.log('Processing weather data:', weatherData); // Log the weather data
    console.log('Weather data received:', weatherData); // Log to confirm data is received
    const temp = weatherData.main.temp.toFixed();
    const conditions = weatherData.weather[0].main;

    this.realCityName = weatherData.name;
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

  private cityTimezoneOffset: number = 0;
  
  performSearch(): void {
    const city = (document.getElementById('city-search') as HTMLInputElement).value;
    this.http.get('https://api.openweathermap.org/data/2.5').subscribe((data: any) => {
      this.realCityName = data.name;
      this.description = data.weather[0].description;
      // Use the existing determineCity method to set the imageClass, etc.
      this.city = this.determineCity(data.main.temp, data.weather[0].main);
    })
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
  this.convertForecastDataToSelectedUnit();
  this.convertDailyForecastToSelectedUnit(); // Update daily forecast temperatures
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

convertForecastDataToSelectedUnit(): void {
  if (this.forecastData && this.forecastData.length > 0) {
    this.forecastData = this.forecastData.map(day => {
      // If original temperatures are not set, store them
      if (!day.temp.originalMax) {
        day.temp.originalMax = day.temp.max;
        day.temp.originalMin = day.temp.min;
      }
      // Convert based on the selected unit
      return {
        ...day,
        temp: {
          max: this.unit === 'Fahrenheit' ? day.temp.originalMax : this.convertToCelsius(day.temp.originalMax),
          min: this.unit === 'Fahrenheit' ? day.temp.originalMin : this.convertToCelsius(day.temp.originalMin),
          originalMax: day.temp.originalMax,
          originalMin: day.temp.originalMin
        }
      };
    });
  }
}

convertDailyForecastToSelectedUnit(): void {
  if (this.dailyForecast) {
    // Convert morning temperature
    if (this.dailyForecast.morning) {
      if (!this.dailyForecast.morning.originalTemp) {
        this.dailyForecast.morning.originalTemp = this.dailyForecast.morning.temp; // Store the original Fahrenheit temperature
      }
      this.dailyForecast.morning.temp = this.unit === 'Fahrenheit'
        ? this.dailyForecast.morning.originalTemp
        : this.convertToCelsius(this.dailyForecast.morning.originalTemp);
    }

    // Convert noon temperature
    if (this.dailyForecast.noon) {
      if (!this.dailyForecast.noon.originalTemp) {
        this.dailyForecast.noon.originalTemp = this.dailyForecast.noon.temp; // Store the original Fahrenheit temperature
      }
      this.dailyForecast.noon.temp = this.unit === 'Fahrenheit'
        ? this.dailyForecast.noon.originalTemp
        : this.convertToCelsius(this.dailyForecast.noon.originalTemp);
    }

    // Convert afternoon temperature
    if (this.dailyForecast.afternoon) {
      if (!this.dailyForecast.afternoon.originalTemp) {
        this.dailyForecast.afternoon.originalTemp = this.dailyForecast.afternoon.temp; // Store the original Fahrenheit temperature
      }
      this.dailyForecast.afternoon.temp = this.unit === 'Fahrenheit'
        ? this.dailyForecast.afternoon.originalTemp
        : this.convertToCelsius(this.dailyForecast.afternoon.originalTemp);
    }
  }
}


  // Helper function to convert Fahrenheit to Celsius
  private convertToCelsius(tempFahrenheit: number): number {
    return ((tempFahrenheit - 32) * 5) / 9;
  }
}
