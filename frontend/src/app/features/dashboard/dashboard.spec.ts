import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component'; 

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Si el componente es Standalone, va en imports. 
      // Si no, debería ir en declarations.
      imports: [DashboardComponent] 
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Es mejor usar detectChanges() aquí
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});