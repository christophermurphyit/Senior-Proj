import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-hamburger-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hamburger-menu.component.html',
  styleUrls: ['./hamburger-menu.component.css']
})
export class HamburgerMenuComponent {
  isMenuOpen = false;
  //selectedUnit: 'Fahrenheit' | 'Celsius' = 'Fahrenheit'; // Default to Fahrenheit
  selectedView: 'current' | '7day' | 'daily' = 'current'; // Default view


  constructor(private router: Router) {}


  @Output() unitChange = new EventEmitter<'Fahrenheit' | 'Celsius'>();
  @Output() forecastChanged = new EventEmitter<'current' | '7day' | 'daily'>(); // Emit changes to parent component
  @Input() selectedUnit: 'Fahrenheit' | 'Celsius' = 'Fahrenheit'; // Receive the selected unit from parent


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
}
