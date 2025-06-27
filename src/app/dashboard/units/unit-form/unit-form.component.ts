import {
  Component,
  effect,
  EventEmitter,
  inject,
  OnDestroy,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';
import { MatIcon } from '@angular/material/icon';
import { ProgressBarComponent } from '../../../shared/global/progress-bar/progress-bar.component';
import { UnitsService } from '../../../services/units-service/units.service';
import { FormService } from '../../../services/form-service/form.service';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ImageUploadComponent } from '../../../shared/dashboard-components/image-upload/image-upload.component';
import { PropertiesService } from '../../../services/properties-service/properties.service';
import { PropertyShort } from '../../../models/service.model';
import {
  disableBackgroundScroll,
  enableBackgroundScroll,
} from '../../../utils/scroll.utils';
import { CommonModule } from '@angular/common';
import { AmenitiesFormComponent } from '../amenities-form/amenities-form.component';

@Component({
  selector: 'app-unit-form',
  standalone: true,
  imports: [
    ClickOutsideDirective,
    MatIcon,
    ProgressBarComponent,
    ReactiveFormsModule,
    ImageUploadComponent,
    CommonModule,
    AmenitiesFormComponent,
  ],
  templateUrl: './unit-form.component.html',
  styleUrl: './unit-form.component.scss',
})
export class UnitFormComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter();
  unitService = inject(UnitsService);
  formService = inject(FormService);
  propertyService = inject(PropertiesService);
  images: any;
  newImageDescriptions!: string[];
  imagePreviews!: any[];
  missingDescription: boolean = false;

  unitTypes = [
    'apartment',
    'villa',
    'house',
    'studio',
    'suite',
    'cabin',
    'condo',
    'townhouse',
  ];
  unitStatus = ['available', 'booked', 'unavailable', 'maintenance'];
  amenitiesOpen = signal(false);
  amenities = signal<number[]>(
    this.unitService.selectedUnit()?.amenities || []
  );

  unitCapacityValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
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

  unitForm = new FormBuilder().nonNullable.group(
    {
      name: ['', Validators.required],
      description: ['', Validators.required],
      capacity: [0, [Validators.required, Validators.min(1)]],
      max_capacity: [0, [Validators.required, Validators.min(1)]],
      price_per_night: [0, [Validators.required, Validators.min(0)]],
      price_per_extra_person: [0, [Validators.required, Validators.min(0)]],
      property: [null as PropertyShort | null, Validators.required],
      type: ['apartment', Validators.required],
      status: ['available', Validators.required],
      active: [true, Validators.required],
      amenities: [[] as number[]],
    },
    { validators: this.unitCapacityValidator }
  );

  /**
   * Lifecycle hook that resets the form and closes the form modal when the UnitService has successfully saved a unit.
   * This is necessary because the form is reused for both creating and editing units.
   */
  constructor() {
    effect(
      () => {
        if (this.unitService.successful()) {
          this.formService.resetForm(this.unitForm);
          this.closeForm();
        }
      },
      { allowSignalWrites: true }
    );
  }

  closeForm = () => {
    this.close.emit();
    this.unitForm.patchValue({ property: null });
  };

  /**
   * Lifecycle hook that is called after Angular has fully initialized a component.
   * Disables background scrolling and checks if a unit is selected.
   * If a unit is selected, it patches the unit form with the selected unit's details,
   * including name, description, capacity, pricing details, property, type, status,
   * active state, and amenities.
   */
  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'instant' });
    disableBackgroundScroll();
    const selected = this.unitService.selectedUnit();
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
        active: selected.active,
        amenities: selected.amenities,
      });
    }
  }

  /**
   * Submits the unit form and creates a new unit.
   *
   * @remarks
   * This function takes the unit form's value and creates a new FormData object.
   * It adds all the form's values to the formData object, and also adds the selected
   * amenities, property ID, and property data to the formData object.
   * Finally, it calls the UnitsService's createUnit method with the formData object,
   * the images, and the new image descriptions.
   */
  createUnit() {
    const { property, amenities, ...rest } = this.unitForm.value;
    const formData = new FormData();
    Object.entries(rest).forEach(([key, value]) => {
      formData.append(key, String(value ?? ''));
    });
    (amenities || []).forEach((id) => {
      formData.append('amenities', String(id));
    });
    formData.append('property_id', (property as PropertyShort).id.toString());
    formData.append('property', JSON.stringify(property));
    this.unitService.createUnit(
      formData,
      this.images,
      this.newImageDescriptions
    );
  }

  /**
   * Submits the unit form and updates the currently selected unit.
   *
   * @remarks
   * This function takes the unit form's value and creates a new FormData object.
   * It adds all the form's values to the formData object, and also adds the selected
   * amenities, property ID, and property data to the formData object.
   * It then calls the UnitsService's updateUnit method with the formData object,
   * the images, and the new image descriptions.
   * After that, it calls the UnitsService's deleteImage method for all the deleted
   * image IDs, and the UnitsService's updateImageDescription method for all the
   * updated image descriptions.
   * Finally, it clears the deleted image IDs, resets the selected unit, reloads the
   * paginated units, and closes the form.
   */
  updateUnit() {
    const { property, amenities, ...rest } = this.unitForm.value;
    const formData = new FormData();
    Object.entries(rest).forEach(([key, value]) => {
      formData.append(key, String(value ?? ''));
    });
    formData.append('property_id', (property as PropertyShort).id.toString());
    formData.append('unit', JSON.stringify(property));
    (amenities || []).forEach((id) => {
      formData.append('amenities', String(id));
    });
    const imageIdsToDelete = [...this.unitService.deletedImageIds()];
    const updateExistingDescriptions = (
      this.unitService.selectedUnit()?.images || []
    ).map((img) =>
      this.unitService.updateImageDescription(img.id, img.alt_text)
    );
    this.unitService.updateUnit(
      formData,
      this.images,
      this.newImageDescriptions,
      () => {
        Promise.all([
          Promise.all(
            imageIdsToDelete.map((id) => this.unitService.deleteImage(id))
          ),
          Promise.all(updateExistingDescriptions),
        ]).then(() => {
          this.unitService.deletedImageIds.set([]);
          this.unitService.selectedUnit.set(null);
          this.unitService.loadPaginatedUnits(1);
          this.closeForm();
        });
      }
    );
  }

  /**
   * Calls the UnitsService's deleteUnit method, which deletes the selected unit
   * and reloads the paginated units.
   */
  deleteUnit() {
    this.unitService.deleteUnit();
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   * Re-enables background scrolling, clears the selected unit and any deleted image IDs,
   * and emits the close event to notify the parent component.
   */
  ngOnDestroy(): void {
    enableBackgroundScroll();
    this.unitService.selectedUnit.set(null);
    this.unitService.deletedImageIds.set([]);
    this.close.emit();
  }

  /**
   * Checks the unit form for errors and returns the first error message found.
   * It checks for the following errors:
   * - Base Capacity cannot be greater than Max Capacity.
   * - If Base and Max Capacity are equal, Price per Extra Person is not allowed.
   * - Max Capacity is required.
   * - Max Capacity must be at least 1.
   * - Base capacity is required.
   * - Base capacity must be at least 1.
   * - Price per Night is required.
   * - Price per Night must be 0 or higher.
   * - Price per Extra Person is required.
   * - Price per Extra Person must be 0 or higher.
   * If no errors are found, it returns null.
   *
   * @returns The first error message found, or null if no errors are found.
   */
  getCapacityPriceError(): string | null {
    if (this.unitForm.errors?.['capacityExceedsMax']) {
      return 'Base Capacity cannot be greater than Max Capacity.';
    }
    if (this.unitForm.errors?.['extraPriceNotAllowed']) {
      return 'If Base and Max Capacity are equal, Price per Extra Person is not allowed.';
    }
    if (
      this.formService.getFormErrors(this.unitForm, 'max_capacity')?.[
        'required'
      ]
    ) {
      return 'Max Capacity is required.';
    }
    if (
      this.formService.getFormErrors(this.unitForm, 'max_capacity')?.['min']
    ) {
      return 'Max Capacity must be at least 1.';
    }
    if (
      this.formService.getFormErrors(this.unitForm, 'capacity')?.['required']
    ) {
      return 'Base capacity is required.';
    }
    if (this.formService.getFormErrors(this.unitForm, 'capacity')?.['min']) {
      return 'Base capacity must be at least 1.';
    }
    if (
      this.formService.getFormErrors(this.unitForm, 'price_per_night')?.[
        'required'
      ]
    ) {
      return 'Price per Night is required.';
    }
    if (
      this.formService.getFormErrors(this.unitForm, 'price_per_night')?.['min']
    ) {
      return 'Price per Night must be 0 or higher.';
    }
    if (
      this.formService.getFormErrors(this.unitForm, 'price_per_extra_person')?.[
        'required'
      ]
    ) {
      return 'Price per Extra Person is required.';
    }
    if (
      this.formService.getFormErrors(this.unitForm, 'price_per_extra_person')?.[
        'min'
      ]
    ) {
      return 'Price per Extra Person must be 0 or higher.';
    }
    return null;
  }

  /**
   * Opens the amenities form component.
   * @remarks
   * This function sets the amenitiesOpen signal to true, which
   * opens the amenities form component.
   */
  openAmenities() {
    this.amenitiesOpen.set(true);
  }

  closeAmenities = () => {
    this.amenitiesOpen.set(false);
    this.unitService.patchAmenities(this.unitForm.value.amenities as number[]);
    this.unitForm.patchValue({ amenities: this.amenities() });
  };
}
