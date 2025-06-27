import {
  Component,
  effect,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { FormService } from '../../../services/form-service/form.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PropertiesService } from '../../../services/properties-service/properties.service';
import { ProgressBarComponent } from '../../../shared/global/progress-bar/progress-bar.component';
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../../../services/auth/auth.service';
import { ImageUploadComponent } from '../../../shared/dashboard-components/image-upload/image-upload.component';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [
    ProgressBarComponent,
    ReactiveFormsModule,
    ClickOutsideDirective,
    MatIcon,
    ImageUploadComponent,
  ],
  templateUrl: './property-form.component.html',
  styleUrl: './property-form.component.scss',
})
export class PropertyFormComponent {
  formService = inject(FormService);
  propertyService = inject(PropertiesService);
  auth = inject(AuthService);
  @Output() close = new EventEmitter();
  images: any;
  newImageDescriptions!: string[];
  imagePreviews!: any[];
  missingDescription: boolean = false;

  propertyForm = new FormBuilder().nonNullable.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    active: [true, Validators.required],
    email: [
      '',
      [Validators.required, Validators.pattern(this.formService.emailPattern)],
    ],
    address: new FormBuilder().nonNullable.group({
      street: ['', Validators.required],
      house_number: ['', Validators.required],
      postal_code: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(this.formService.phonePattern),
        ],
      ],
    }),
  });

  /**
   * Watch for successful property service operations and reset the property form
   * and emit a close event when the operation is successful.
   */
  constructor() {
    effect(
      () => {
        if (this.propertyService.successful()) {
          this.formService.resetForm(this.propertyForm);
          this.closeForm();
        }
      },
      { allowSignalWrites: true }
    );
  }

  /**
   * Lifecycle hook that is called after Angular has fully initialized a component.
   * Clears the deleted images list and if a property is selected, it patches the property form with the selected property values.
   */
  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.propertyService.clearDeletedImages();
    const selected = this.propertyService.selectedProperty();
    if (selected) {
      this.propertyForm.patchValue({
        name: selected.name,
        address: selected.address,
        description: selected.description,
        active: selected.active,
        email: selected.email,
      });
    }
  }

  /**
   * Creates a new property and adds it to the database.
   *
   * Goes through the property form's values and constructs a FormData object with the values.
   * If a value is an object, it goes through the object's key-value pairs and appends them to the FormData
   * object with the key being `originalKey.subKey`.
   * If a value is not an object, it appends the value to the FormData object with the key being the key from the property form.
   * Then it calls the property service's createProperty method with the constructed FormData, the images, and the new image descriptions.
   */
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
    this.propertyService.createProperty(
      formData,
      this.images,
      this.newImageDescriptions
    );
  }

  /**
   * Deletes the currently selected property from the database.
   *
   * Calls the property service's deleteProperty method.
   */
  deleteProperty() {
    this.propertyService.deleteProperty();
  }

  /**
   * Updates the currently selected property with new data.
   *
   * This method constructs a FormData object from the property form values,
   * and calls the property service's updateProperty method. It also handles
   * image updates and deletions by sending requests to delete marked images
   * and update image descriptions. Once completed, it clears the list of
   * deleted images, resets the selected property, reloads the properties
   * list, and closes the form.
   */
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
    this.propertyService.updateProperty(
      formData,
      this.images,
      this.newImageDescriptions,
      () => {
        const deletedImageIds = [...this.propertyService.deletedImageIds()];
        const updateExistingDescriptions = (
          this.propertyService.selectedProperty()?.images || []
        ).map((img) =>
          this.propertyService.updateImageDescription(img.id, img.alt_text)
        );
        Promise.all([
          Promise.all(
            deletedImageIds.map((id) => this.propertyService.deleteImage(id))
          ),
          Promise.all(updateExistingDescriptions),
        ]).then(() => {
          this.propertyService.clearDeletedImages();
          this.propertyService.selectedProperty.set(null);
          this.propertyService.loadProperties();
          this.closeForm();
        });
      }
    );
  }

  closeForm = () => {
    this.propertyService.selectedProperty.set(null);
    this.imagePreviews = [];
    this.images = [];
    this.close.emit();
  };

  /**
   * Checks if the city or postal code field has a required error and if
   * either of them are touched or dirty. If either of them is invalid, returns
   * an error message. Otherwise, returns null.
   * @returns {string | null} Error message or null if both fields are valid.
   */
  getCityErrors() {
    let city = this.propertyForm.get('address')?.get('city');
    let postalCode = this.propertyForm.get('address')?.get('postal_code');
    const cityInvalid =
      city?.errors?.['required'] && (city?.touched || city?.dirty);
    let postalCodeInvalid =
      postalCode?.errors?.['required'] &&
      (postalCode?.touched || postalCode?.dirty);
    if (cityInvalid || postalCodeInvalid) {
      return 'City and Postal Code are required';
    }
    return null;
  }

  /**
   * Checks if the phone or country field has a required error or a phone pattern error
   * and if either of them are touched or dirty. If either of them is invalid, returns
   * an error message. Otherwise, returns null.
   * @returns {string | null} Error message or null if both fields are valid.
   */

  getPhoneCountryErrors() {
    let phone = this.propertyForm.get('address')?.get('phone');
    let country = this.propertyForm.get('address')?.get('country');
    const phoneInvalid =
      phone?.errors?.['required'] && (phone?.touched || phone?.dirty);
    const phonePattern =
      phone?.errors?.['pattern'] && (phone?.touched || phone?.dirty);
    const countryInvalid =
      country?.errors?.['required'] && (country?.touched || country?.dirty);
    if (countryInvalid) {
      return 'Country is required';
    }
    if (phoneInvalid) {
      return 'Phone is required';
    }
    if (phonePattern) {
      return 'Wrong phone format';
    }
    return null;
  }

  /**
   * Checks if the street or house number field has a required error and if
   * either of them are touched or dirty. If either of them is invalid, returns
   * an error message. Otherwise, returns null.
   * @returns {string | null} Error message or null if both fields are valid.
   */
  getStreetErrors() {
    let street = this.propertyForm.get('address')?.get('street');
    let houseNumber = this.propertyForm.get('address')?.get('house_number');
    const streetInvalid =
      street?.errors?.['required'] && (street?.touched || street?.dirty);
    let houseNumberInvalid =
      houseNumber?.errors?.['required'] &&
      (houseNumber?.touched || houseNumber?.dirty);
    if (streetInvalid || houseNumberInvalid) {
      return 'Street and House Number are required';
    }
    return null;
  }

  /**
   * Checks for errors related to the 'email' field in the property form.
   * Returns an error message if the 'email' field is required and not entered,
   * or if the email format is invalid. Otherwise, returns null.
   * @returns {string | null} Error message or null if the field is valid.
   */
  getEmailErrors() {
    let email = this.propertyForm.get('email');
    const emailRequired =
      email?.errors?.['required'] && (email?.touched || email?.dirty);
    const emailInvalid =
      email?.errors?.['pattern'] && (email?.touched || email?.dirty);
    if (emailRequired) {
      return 'Email is required';
    }
    if (emailInvalid) {
      return 'Wrong email format';
    }
    return null;
  }
}
