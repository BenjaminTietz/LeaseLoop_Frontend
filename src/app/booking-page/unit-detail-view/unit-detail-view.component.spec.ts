import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitDetailViewComponent } from './unit-detail-view.component';

describe('UnitDetailViewComponent', () => {
  let component: UnitDetailViewComponent;
  let fixture: ComponentFixture<UnitDetailViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitDetailViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
