import { TestBed } from '@angular/core/testing';

import { ClientBookingService } from './client-booking.service';

describe('ClientBookingService', () => {
  let service: ClientBookingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientBookingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
