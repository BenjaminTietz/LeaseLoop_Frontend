import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FillDataOverlayComponent } from './fill-data-overlay.component';

describe('FillDataOverlayComponent', () => {
  let component: FillDataOverlayComponent;
  let fixture: ComponentFixture<FillDataOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FillDataOverlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FillDataOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
