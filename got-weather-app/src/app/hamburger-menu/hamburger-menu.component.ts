import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-hamburger-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hamburger-menu.component.html',
  styleUrls: ['./hamburger-menu.component.css']
})
export class HamburgerMenuComponent {
  isMenuOpen = false;
  selectedUnit: 'Fahrenheit' | 'Celsius' = 'Fahrenheit'; // Default to Fahrenheit
  isLoggedIn = false;

  @Output() unitChange = new EventEmitter<'Fahrenheit' | 'Celsius'>();
  @Output() favoriteSearch = new EventEmitter<string>(); // Add Output for favorite search

  constructor(private router: Router, private authService: AuthService, private http: HttpClient) {}


  ngOnInit() {
    // Subscribe to authentication state changes
    this.authService.isLoggedIn$.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  handleAuthAction() {
    if (this.authService.isAuthenticated()) {
      alert('You are being logged out.');
      this.authService.logout(); // Log out the user
      this.router.navigate(['/']); // Redirect to homepage
    } else {
      this.router.navigate(['/login']); // Redirect to login page
    }
  }

  setUnit(unit: 'Fahrenheit' | 'Celsius') {
    this.selectedUnit = unit;
    this.unitChange.emit(this.selectedUnit); // Emit the selected unit
  }

  navigateToLogin() {
    this.isMenuOpen = false; // Optional: close the menu after navigation
    this.router.navigate(['/login']); // Navigate to the login page
  }

  navigateToCreate() {
    this.isMenuOpen = false; // Optional: close the menu after navigation
    this.router.navigate(['/create-account']); // Navigate to the login page
  }

  emitFavoriteSearch() {
    const loggedInUser = this.authService.getCurrentUser();
    if (!loggedInUser) {
      alert('Please log in to access your favorite location.');
      return;
    }
  
    this.http.get(`/getFavoriteLocation?usernameOrEmail=${loggedInUser}`).subscribe({
      next: (response: any) => {
        if (response.favoriteLocation) {
          this.favoriteSearch.emit(response.favoriteLocation);
        } else {
          alert('No favorite location found for your account.');
        }
      },
      error: (error) => {
        console.error('Error retrieving favorite location:', error);
        alert('Error retrieving favorite location. Please try again later.');
      }
    });
  }
  
  
}
