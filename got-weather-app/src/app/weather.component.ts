import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { FooterComponent } from './footer.component';
import { WeatherService } from './weather.service';
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
  forecastData: any[] = []; //Array to store the 7-day forecast
  private _selectedSignal: 'current' | '7day' | 'daily' = 'current'; // Default signal
  dailyForecast: any;


  private readonly apiKey = 'd474509725247f01f4f5b322d067dd8b';
  private readonly apiUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(private http: HttpClient, private weatherService: WeatherService) {}


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
      .get(`${this.apiUrl}/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=imperial`)
      .subscribe({
        next: (data: any) => {
          console.log('Weather data received:', data); // Log to confirm data is received
          this.renderDOM(data);
        },
        error: () => alert('Error fetching weather data. Please try again later.'),
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
    if (this.selectedSignal === 'current') {
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
    } else if (this.selectedSignal === '7day') {
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
            alert('City not found. Please try a different city.');
          },
        });
    } else if (this.selectedSignal === 'daily') {
      console.log('Fetch daily forecast logic here');
      // Add logic for daily forecast
      console.log('Fetching daily forecast data...');
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
        alert('City not found. Please try a different city.');
      },
    });
    }
  }
  

  /*private get7DayForecast(lat: number, lon: number) {
    const oneCallUrl = `${this.weatherService.oneCallApiUrl}?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${this.apiKey}&units=imperial`;
  this.http
    .get(oneCallUrl)
    .subscribe({
      next: (forecastData: any) => {
        this.forecastData = forecastData.daily; // Correct property is 'daily'
        console.log('7-Day Forecast Data:', this.forecastData);
      },
      error: () => console.error('Error fetching 7-day forecast'),
    });
  }*/



  
  /*searchCity(cityName: string): void {
  // Fetch current weather to get latitude and longitude
  this.weatherService.getCurrentWeather(cityName).subscribe({
    next: (data: any) => {
      const lat = data.coord.lat;
      const lon = data.coord.lon;// Extract latitude and longitude
      console.log(`Latitude: ${lat}, Longitude: ${lon}`);

      // Fetch 7-day forecast using latitude and longitude
      this.weatherService.get7DayForecast(lat, lon).subscribe({
        next: (forecastData: any) => {
          this.forecastData = forecastData.daily; // Assign daily forecast data
          console.log('7-Day Forecast Data:', this.forecastData);
        },
        error: (err) => {
          console.error('Error fetching 7-day forecast:', err);
        }
      });
    },
    error: (err) => {
      console.error('Error fetching current weather:', err);
      alert('City not found. Please try a different city.');
    }
  });
} */



/*fetch7DayForecast(cityName: string): void {
  // Call `searchCity` to get latitude and longitude
  this.http
    .get(`${this.apiUrl}?q=${cityName}&appid=${this.apiKey}&units=imperial`)
    .subscribe({
      next: (data: any) => {
        const lat = data.coord.lat; // Extract latitude
        const lon = data.coord.lon; // Extract longitude
        console.log(`Latitude: ${lat}, Longitude: ${lon}`);

        // Now fetch the 7-day forecast
        this.weatherService.get7DayForecast(lat, lon).subscribe({
          next: (forecastData: any) => {
            this.forecastData = forecastData.list; // Assign forecast data
            console.log('7-Day Forecast Data:', this.forecastData);
          },
          error: () => console.error('Error fetching 7-day forecast'),
        });
      },
      error: () => alert('City not found. Please try a different city.'),
    });
}*/




/*
  searchCity(cityName: string): void {
    this.http
      .get(`${this.apiUrl}?q=${cityName}&appid=${this.apiKey}&units=imperial`)
      .subscribe({
        next: (data: any) => this.renderDOM(data),
        error: () => alert('City not found. Please try a different city.'),
      });

      this.weatherService.get7DayForecast(cityName).subscribe({
        next: (data: any) => {
        this.forecastData = data.list;
        console.log(this.forecastData);
        },
        error: () => console.error('Error fetching 7-day forecast')
      });
  }
  */

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
    if (event.key === "Enter") {
      this.performSearch();
    }
  }

  performSearch(): void {
    const searchInput = (document.getElementById('city-search') as HTMLInputElement).value;
    if (searchInput) {
      this.searchCity(searchInput);
    }
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
  this.convertForecastDataToSelectedUnit();
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


// Helper function to convert Fahrenheit to Celsius
private convertToCelsius(tempFahrenheit: number): number {
  return (tempFahrenheit - 32) * 5 / 9;
}


}
