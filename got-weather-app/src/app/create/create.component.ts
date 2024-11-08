import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { HttpClient } from '@angular/common/http'; // Import HttpClient for HTTP requests
import { Router } from '@angular/router';



@Component({
  selector: 'app-create',
  standalone: true,
  imports: [FormsModule], // Remove provideHttpClient here
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent {
  email = '';
  username = '';
  password = '';
  favoriteLocation = '';
  message = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    console.log("Preparing to send request:", this.email, this.username, this.password, this.favoriteLocation);
    console.log('Form submitted'); // Add this line to confirm if the method is triggered
    // Check if all fields are filled
    if (!this.email || !this.username || !this.password || !this.favoriteLocation) {
      this.message = "All fields are required.";
      return;
    }

    // Send account data to the backend
    this.http.post('http://localhost:5001/createAccount', {
      email: this.email,
      username: this.username,
      password: this.password,
      favoriteLocation: this.favoriteLocation
    }).subscribe({
      next: () => {
        this.message = "Account created successfully!";
      },
      error: (error) => {
        if (error.status === 409) {
          this.message = "Username or email already exists.";
        } else if (error.status === 400) {
          this.message = "All fields are required.";
        } else {
          this.message = "An error occurred. Please try again.";
        }
   
      }
    });
  }
  goHome() {
    this.router.navigate(['/home']); // Adjust '/home' to your actual home page route
  }
}
