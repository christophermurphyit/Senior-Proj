import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateComponent } from './create.component'; // Update to CreateComponent

describe('CreateComponent', () => { // Update to CreateComponent
  let component: CreateComponent;
  let fixture: ComponentFixture<CreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateComponent] // Update to CreateComponent
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateComponent); // Update to CreateComponent
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
