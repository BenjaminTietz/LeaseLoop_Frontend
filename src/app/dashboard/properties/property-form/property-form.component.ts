import { Component, effect, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormService } from '../../../services/form-service/form.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PropertiesService } from '../../../services/properties-service/properties.service';
import { ProgressBarComponent } from "../../../shared/global/progress-bar/progress-bar.component";
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../../../services/auth/auth.service';
import { ImageUploadComponent } from "../../../shared/dashboard-components/image-upload/image-upload.component";

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [ProgressBarComponent, ReactiveFormsModule, ClickOutsideDirective, MatIcon, ImageUploadComponent],
  templateUrl: './property-form.component.html',
  styleUrl: './property-form.component.scss'
})
export class PropertyFormComponent {
  formService = inject(FormService);
  propertyService = inject(PropertiesService);
  auth = inject(AuthService);
  @Output() close = new EventEmitter();
  images :any
  newImageDescriptions!: string[]
  imagePreviews! : any []
  missingDescription : boolean = false


  propertyForm  = new FormBuilder().nonNullable.group({
    name: ['' , Validators.required],
    description: ['', Validators.required],
    active: [true, Validators.required],
    address: new FormBuilder().nonNullable.group({
      street: ['', Validators.required],
      house_number: ['', Validators.required],
      postal_code: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(this.formService.phonePattern)]],
    }),
  })

  constructor() {
    effect(() => {
      if (this.propertyService.successful()) {
        this.formService.resetForm(this.propertyForm);
        this.closeForm();
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.propertyService.clearDeletedImages();
    const selected = this.propertyService.selectedProperty();
    if (selected) {
      this.propertyForm.patchValue({
        name: selected.name,
        address: selected.address,
        description: selected.description,
        active: selected.active
      });
    }
  }

 

  


  createProperty() {
    const raw = this.propertyForm.value;
    const formData = new FormData();
  
    Object.entries(raw).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([subKey, subValue]) => {
          formData.append(`${key}.${subKey}`, String(subValue ?? ''));
        });
      } else {
        formData.append(key, String(value ?? ''));
      }
    });
  
    this.propertyService.createProperty(formData, this.images, this.newImageDescriptions);
  }

  deleteProperty() {
    this.propertyService.deleteProperty();
  }

  updateProperty() {
    const raw = this.propertyForm.value;
    const formData = new FormData();
    Object.entries(raw).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([subKey, subValue]) => {
          formData.append(`${key}.${subKey}`, String(subValue ?? ''));
        });
      } else {
        formData.append(key, String(value ?? ''));
      }
    });
  
    this.propertyService.updateProperty(formData, this.images, this.newImageDescriptions, () => {
      const deletedImageIds = [...this.propertyService.deletedImageIds()];
      const updateExistingDescriptions = (this.propertyService.selectedProperty()?.images || []).map(img =>
        this.propertyService.updateImageDescription(img.id, img.alt_text)
      );
    
      Promise.all([
        Promise.all(deletedImageIds.map(id => this.propertyService.deleteImage(id))),
        Promise.all(updateExistingDescriptions)
      ]).then(() => {
        this.propertyService.clearDeletedImages();
        this.propertyService.selectedProperty.set(null);
        this.propertyService.loadProperties();
        this.closeForm();
      });
    });
  }

  closeForm = () => {
    this.propertyService.selectedProperty.set(null);
    this.imagePreviews = [];
    this.images = [];
    this.close.emit();
    
  }

  getCityErrors() {
    let city = this.propertyForm.get('address')?.get('city');
    let postalCode = this.propertyForm.get('address')?.get('postal_code');
    const cityInvalid = city?.errors?.['required'] && (city?.touched || city?.dirty);
    let postalCodeInvalid = postalCode?.errors?.['required'] && (postalCode?.touched || postalCode?.dirty);
    if (cityInvalid || postalCodeInvalid) {
      return 'City and Postal Code are required';
    }
    return null;
  }

  getPhoneCountryErrors() {
    let phone = this.propertyForm.get('address')?.get('phone');
    let country = this.propertyForm.get('address')?.get('country');
    const phoneInvalid = phone?.errors?.['required'] && (phone?.touched || phone?.dirty);
    const phonePattern = phone?.errors?.['pattern'] && (phone?.touched || phone?.dirty);
    const countryInvalid = country?.errors?.['required'] && (country?.touched || country?.dirty);
    if (countryInvalid) { return 'Country is required'; }
    if (phoneInvalid ) { return 'Phone is required'; }
    if (phonePattern) { return 'Wrong phone format'; }
    return null;
  }

  getStreetErrors() {
    let street = this.propertyForm.get('address')?.get('street');
    let houseNumber = this.propertyForm.get('address')?.get('house_number');
    const streetInvalid = street?.errors?.['required'] && (street?.touched || street?.dirty);
    let houseNumberInvalid = houseNumber?.errors?.['required'] && (houseNumber?.touched || houseNumber?.dirty);
    if (streetInvalid || houseNumberInvalid) {
      return 'Street and House Number are required';
    }
    return null;
  }

 
 
  
}
