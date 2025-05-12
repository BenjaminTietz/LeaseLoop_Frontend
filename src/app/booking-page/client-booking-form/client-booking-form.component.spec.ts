import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientBookingFormComponent } from './client-booking-form.component';

describe('ClientBookingFormComponent', () => {
  let component: ClientBookingFormComponent;
  let fixture: ComponentFixture<ClientBookingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientBookingFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientBookingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
