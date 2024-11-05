import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create',  // Changed selector from 'app-login' to 'app-create'
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create.component.html',  // Changed from 'login.component.html'
  styleUrls: ['./create.component.css']  // Changed from 'login.component.css'
})
export class CreateComponent {  // Changed class name from LoginComponent to CreateComponent
  onSubmit() {
    console.log("Form submitted");
  }
}
