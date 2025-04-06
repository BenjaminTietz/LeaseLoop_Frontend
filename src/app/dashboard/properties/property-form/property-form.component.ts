import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormService } from '../../../services/form-service/form.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PropertiesService } from '../../../services/properties-service/properties.service';
import { ProgressBarComponent } from "../../../shared/global/progress-bar/progress-bar.component";
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [ ProgressBarComponent, ReactiveFormsModule, ClickOutsideDirective, MatIcon ],
  templateUrl: './property-form.component.html',
  styleUrl: './property-form.component.scss'
})
export class PropertyFormComponent {
  formService = inject(FormService);
  propertyService = inject(PropertiesService);
  @Output() close = new EventEmitter();

  propertyForm  = new FormBuilder().nonNullable.group({
    name: ['' , Validators.required],
    address: [ '', Validators.required],
    description: ['', Validators.required]
  })

  ngOnInit(): void {
    const selected = this.propertyService.selectedProperty();
    if (selected) {
      this.propertyForm.patchValue({
        name: selected.name,
        address: selected.address,
        description: selected.description
      });
    }
  }


  createProperty() {
  }

  deleteProperty() {
  }

  closeForm = () => {
    this.close.emit();
  }
}
