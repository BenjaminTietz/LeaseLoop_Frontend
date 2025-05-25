import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyDetailViewComponent } from './property-detail-view.component';

describe('PropertyDetailViewComponent', () => {
  let component: PropertyDetailViewComponent;
  let fixture: ComponentFixture<PropertyDetailViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyDetailViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
