import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeAdressFormComponent } from './change-adress-form.component';

describe('ChangeAdressFormComponent', () => {
  let component: ChangeAdressFormComponent;
  let fixture: ComponentFixture<ChangeAdressFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeAdressFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeAdressFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
