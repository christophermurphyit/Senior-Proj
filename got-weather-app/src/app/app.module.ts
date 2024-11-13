import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    // List of components
  ],
  imports: [
    // Other modules (e.g., BrowserModule, FormsModule)
    HttpClientModule,  // Add this line
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

