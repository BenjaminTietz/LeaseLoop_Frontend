import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromocodesFormComponent } from './promocodes-form.component';

describe('PromocodesFormComponent', () => {
  let component: PromocodesFormComponent;
  let fixture: ComponentFixture<PromocodesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromocodesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromocodesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
