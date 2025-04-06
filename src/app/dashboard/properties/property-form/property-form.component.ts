import { Component, effect, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormService } from '../../../services/form-service/form.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PropertiesService } from '../../../services/properties-service/properties.service';
import { ProgressBarComponent } from "../../../shared/global/progress-bar/progress-bar.component";
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../../../services/auth/auth.service';

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
  auth = inject(AuthService);
  @Output() close = new EventEmitter();

  images: any[] = [];

  propertyForm  = new FormBuilder().nonNullable.group({
    name: ['' , Validators.required],
    address: [ '', Validators.required],
    description: ['', Validators.required],
  })

  constructor() {
    effect(() => {
      if (this.propertyService.successful()) {
        this.formService.resetForm(this.propertyForm);
        this.closeForm();
      }
    });
  }

  ngOnInit(): void {
    const selected = this.propertyService.selectedProperty();
    console.log(selected);
    
    if (selected) {
      this.propertyForm.patchValue({
        name: selected.name,
        address: selected.address,
        description: selected.description
      });
    }
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files: File[] = Array.from(input.files);
      this.images.push(...files);
    }
  }


  createProperty() {
    const raw = this.propertyForm.value;
  
    const formData = new FormData();
    Object.entries(raw).forEach(([key, value]) => {
      formData.append(key, value ?? '');
    });
  
    this.propertyService.createProperty(formData, this.images);
  }

  deleteProperty() {
    this.propertyService.deleteProperty();
  }

  updateProperty() {
    this.propertyService.updateProperty(this.propertyForm.value);
  }

  closeForm = () => {
    this.close.emit();
  }

  
}
