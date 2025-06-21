import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingStatusPopupComponent } from './booking-status-popup.component';

describe('BookingStatusPopupComponent', () => {
  let component: BookingStatusPopupComponent;
  let fixture: ComponentFixture<BookingStatusPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingStatusPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingStatusPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
