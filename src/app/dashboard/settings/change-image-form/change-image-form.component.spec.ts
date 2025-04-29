import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeImageFormComponent } from './change-image-form.component';

describe('ChangeImageFormComponent', () => {
  let component: ChangeImageFormComponent;
  let fixture: ComponentFixture<ChangeImageFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeImageFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeImageFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
