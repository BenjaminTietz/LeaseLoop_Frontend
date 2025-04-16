import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingChartComponent } from './booking-chart.component';

describe('BookingChartComponent', () => {
  let component: BookingChartComponent;
  let fixture: ComponentFixture<BookingChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
