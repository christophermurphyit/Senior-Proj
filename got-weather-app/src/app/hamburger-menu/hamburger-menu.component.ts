import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';

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

  @Output() unitChange = new EventEmitter<'Fahrenheit' | 'Celsius'>();

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  setUnit(unit: 'Fahrenheit' | 'Celsius') {
    this.selectedUnit = unit;
    this.unitChange.emit(this.selectedUnit); // Emit the selected unit
  }
}
