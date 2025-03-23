import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly apiKey = 'd474509725247f01f4f5b322d067dd8b'; // Your API key
  private readonly apiUrl = 'https://api.openweathermap.org/data/3.0'; // Base URL for the OpenWeather API
  private readonly oneCallApiUrl = 'https://api.openweathermap.org/data/3.0/onecall'; // One Call API Base URL

  constructor(private http: HttpClient) {}

  // Fetch current weather data
  getCurrentWeather(city: string): Observable<any> {
    const url = `${this.apiUrl}/weather?q=${city}&appid=${this.apiKey}&units=imperial`;
    return this.http.get(url);
  }

  // Fetch 7-day forecast data
  get7DayForecast(lat: number, lon: number): Observable<any> {
    const url = `${this.apiUrl}/onecall?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=imperial`;
    return this.http.get(url);
  }
}

