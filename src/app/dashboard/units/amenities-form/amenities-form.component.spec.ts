import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmenitiesFormComponent } from './amenities-form.component';

describe('AmenitiesFormComponent', () => {
  let component: AmenitiesFormComponent;
  let fixture: ComponentFixture<AmenitiesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmenitiesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmenitiesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
