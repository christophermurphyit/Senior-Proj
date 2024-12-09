import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, Input } from '@angular/core';
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
  selectedView: 'current' | '7day' | 'daily' = 'current'; // Default view
  isLoggedIn = false;



  constructor(private router: Router, private authService: AuthService, private http: HttpClient) {}

  @Output() favoriteSearch = new EventEmitter<string>(); // Add Output for favorite search
  @Output() unitChange = new EventEmitter<'Fahrenheit' | 'Celsius'>();
  @Output() forecastChanged = new EventEmitter<'current' | '7day' | 'daily'>(); // Emit changes to parent component
  @Input() selectedUnit: 'Fahrenheit' | 'Celsius' = 'Fahrenheit'; // Receive the selected unit from parent

  ngOnInit() {
    // Subscribe to authentication state changes
    this.authService.isLoggedIn$.subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
    });
  }

  handleAuthAction() {
    if (this.authService.isAuthenticated()) {
      alert('You are being logged out.');
      this.authService.logout(); // Log out the user
      this.router.navigate(['/']); // Redirect to homepage
      window.location.reload();
    } else {
      this.router.navigate(['/login']); // Redirect to login page
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  setView(view: 'current' | '7day' | 'daily') {
    this.selectedView = view;
    this.forecastChanged.emit(view); // Emit the selected forecast type
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