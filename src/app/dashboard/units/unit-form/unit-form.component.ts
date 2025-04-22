import { Component, effect, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';
import { MatIcon } from '@angular/material/icon';
import { ProgressBarComponent } from "../../../shared/global/progress-bar/progress-bar.component";
import { UnitsService } from '../../../services/units-service/units.service';
import { FormService } from '../../../services/form-service/form.service';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ImageUploadComponent } from "../../../shared/dashboard-components/image-upload/image-upload.component";
import { PropertiesService } from '../../../services/properties-service/properties.service';
import { PropertyShort } from '../../../models/service.model';
import { disableBackgroundScroll, enableBackgroundScroll } from '../../../utils/scroll.utils';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-unit-form',
  standalone: true,
  imports: [ClickOutsideDirective, MatIcon, ProgressBarComponent, ReactiveFormsModule, ImageUploadComponent, CommonModule],
  templateUrl: './unit-form.component.html',
  styleUrl: './unit-form.component.scss'
})
export class UnitFormComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter();
  unitService = inject(UnitsService)
  formService = inject(FormService)
  propertyService = inject(PropertiesService)
  images: any
  newImageDescriptions!: string[]
  imagePreviews!: any[]
  missingDescription: boolean = false

  unitTypes = ['apartment', 'villa', 'house', 'studio', 'suite', 'cabin', 'condo', 'townhouse']
  unitStatus = ['available', 'booked', 'unavailable', 'booked', 'maintenance']


  unitCapacityValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const capacity = control.get('capacity')?.value;
    const maxCapacity = control.get('max_capacity')?.value;
    const pricePerExtraPerson = control.get('price_per_extra_person')?.value;
    const errors: any = {};
    if (capacity > maxCapacity) {
      errors.capacityExceedsMax = true;
    }
    if (capacity === maxCapacity && pricePerExtraPerson > 0) {
      errors.extraPriceNotAllowed = true;
    }
  
    return Object.keys(errors).length ? errors : null;
  };

  unitForm = new FormBuilder().nonNullable.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    capacity: [0, [Validators.required, Validators.min(1)]],
    max_capacity: [0, [Validators.required, Validators.min(1)]], 
    price_per_night: [0, [Validators.required, Validators.min(0)]], 
    price_per_extra_person: [0, [Validators.required, Validators.min(0)]], 
    property: [null as PropertyShort | null, Validators.required],
    type : ['apartment', Validators.required],
    status : ['available', Validators.required],
    active : [true, Validators.required]
  }, { validators: this.unitCapacityValidator });

  constructor() {
    effect(() => {
      if (this.unitService.successful()) {
        this.formService.resetForm(this.unitForm);
        this.closeForm();
      }
    }, { allowSignalWrites: true });
  }

  closeForm = () => {
    this.close.emit();
    this.unitForm.patchValue({ property: null });
  }


  ngOnInit(): void {
    //this.unitService.clearDeletedImages();
    disableBackgroundScroll();
    this.propertyService.loadProperties();
    const selected = this.unitService.selectedUnit();
    console.log('Selected unit:', selected);
    

    if (selected) {
      this.unitForm.patchValue({
        name: selected.name,
        description: selected.description,
        capacity: selected.capacity,
        price_per_night: selected.price_per_night,
        property: selected.property,
        price_per_extra_person: selected.price_per_extra_person,
        max_capacity: selected.max_capacity,
        type: selected.type,
        status: selected.status,
        active: selected.active
      });
    }    
  }

  createUnit() {
    const { property, ...rest } = this.unitForm.value;
    const formData = new FormData();
    Object.entries(rest).forEach(([key, value]) => {
      formData.append(key, String(value ?? ''));
    });
    formData.append('property_id', (property as PropertyShort).id.toString());
    formData.append('property', JSON.stringify(property));
    this.unitService.createUnit(formData, this.images, this.newImageDescriptions);
  }

  updateUnit() { 
    const { property, ...rest } = this.unitForm.value;
    const formData = new FormData();
  
    Object.entries(rest).forEach(([key, value]) => {
      formData.append(key, String(value ?? ''));
    });
  
    formData.append('property_id', (property as PropertyShort).id.toString());
    formData.append('unit', JSON.stringify(property));
  
    const imageIdsToDelete = [...this.unitService.deletedImageIds()];
  
    const updateExistingDescriptions = (this.unitService.selectedUnit()?.images || []).map(img =>
      this.unitService.updateImageDescription(img.id, img.alt_text)
    );
  
    this.unitService.updateUnit(formData, this.images, this.newImageDescriptions, () => {
      Promise.all([
        Promise.all(imageIdsToDelete.map(id => this.unitService.deleteImage(id))),
        Promise.all(updateExistingDescriptions)
      ]).then(() => {
        this.unitService.deletedImageIds.set([]);
        this.unitService.selectedUnit.set(null);
        this.unitService.loadUnits();
        this.closeForm();
      });
    });
  }


  deleteUnit() { 
    this.unitService.deleteUnit();
  }

  ngOnDestroy(): void {
    enableBackgroundScroll();
    this.unitService.selectedUnit.set(null);
    this.unitService.deletedImageIds.set([]);
    this.unitService.loadUnits();
    this.close.emit()
  }

  getCapacityPriceError(): string | null {
    if (this.unitForm.errors?.['capacityExceedsMax']) { return 'Base Capacity cannot be greater than Max Capacity.'; }
    if (this.unitForm.errors?.['extraPriceNotAllowed']) {return 'If Base and Max Capacity are equal, Price per Extra Person is not allowed.';}
    if (this.formService.getFormErrors(this.unitForm, 'max_capacity')?.['required']) { return 'Max Capacity is required.';}
    if (this.formService.getFormErrors(this.unitForm, 'max_capacity')?.['min']) {return 'Max Capacity must be at least 1.';}
    if (this.formService.getFormErrors(this.unitForm, 'capacity')?.['required']) {return 'Base capacity is required.';}
    if (this.formService.getFormErrors(this.unitForm, 'capacity')?.['min']) { return 'Base capacity must be at least 1.';}
    if (this.formService.getFormErrors(this.unitForm, 'price_per_night')?.['required']) {return 'Price per Night is required.';}
    if (this.formService.getFormErrors(this.unitForm, 'price_per_night')?.['min']) {return 'Price per Night must be 0 or higher.';}
    if (this.formService.getFormErrors(this.unitForm, 'price_per_extra_person')?.['required']) { return 'Price per Extra Person is required.';}
    if (this.formService.getFormErrors(this.unitForm, 'price_per_extra_person')?.['min']) {return 'Price per Extra Person must be 0 or higher.';}
    return null;
  }
  
  
}
