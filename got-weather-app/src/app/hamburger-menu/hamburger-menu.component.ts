import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';


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

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    // Subscribe to authentication state changes
    this.authService.isLoggedIn$.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });
  }


  @Output() unitChange = new EventEmitter<'Fahrenheit' | 'Celsius'>();

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
}
