import { Component, inject, OnInit } from '@angular/core';
import { BookingsService } from '../../services/bookings-service/bookings.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.scss',
})
export class BookingsComponent implements OnInit {
  bs = inject(BookingsService);

  ngOnInit() {
    this.bs.loadBooking();
  }
}
