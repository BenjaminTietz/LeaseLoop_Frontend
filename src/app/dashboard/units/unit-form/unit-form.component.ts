import { Component, effect, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';
import { MatIcon } from '@angular/material/icon';
import { ProgressBarComponent } from "../../../shared/global/progress-bar/progress-bar.component";
import { UnitsService } from '../../../services/units-service/units.service';
import { FormService } from '../../../services/form-service/form.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImageUploadComponent } from "../../../shared/dashboard-components/image-upload/image-upload.component";
import { PropertiesService } from '../../../services/properties-service/properties.service';
import { PropertyShort } from '../../../models/service.model';
import { disableBackgroundScroll, enableBackgroundScroll } from '../../../utils/scroll.utils';

@Component({
  selector: 'app-unit-form',
  standalone: true,
  imports: [ClickOutsideDirective, MatIcon, ProgressBarComponent, ReactiveFormsModule, ImageUploadComponent],
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

  unitForm = new FormBuilder().nonNullable.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    capacity: [0, Validators.required],
    max_capacity: [0, Validators.required],
    price_per_night: [0, Validators.required],
    price_per_extra_person: [0, Validators.required],
    property: [null as PropertyShort | null, Validators.required]  // <- allow null
  });

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
        max_capacity: selected.max_capacity
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
  }
}
