import { TestBed } from '@angular/core/testing';

import { PropertiesService } from './properties.service';

describe('DatabaseService', () => {
  let service: PropertiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PropertiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
