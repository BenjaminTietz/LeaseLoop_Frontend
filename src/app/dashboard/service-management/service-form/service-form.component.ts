import {
  Component,
  effect,
  EventEmitter,
  inject,
  OnInit,
  Output,
} from '@angular/core';
import { FormService } from '../../../services/form-service/form.service';
import { ServiceManagementService } from '../../../services/service-management/service-management.service';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';
import { ProgressBarComponent } from '../../../shared/global/progress-bar/progress-bar.component';
import { MatIcon } from '@angular/material/icon';
import { ServiceType } from '../../../models/service.model';
import { PropertiesService } from '../../../services/properties-service/properties.service';
import { Service } from '../../../models/service.model';
import { Property } from '../../../models/property.model';
import { ServiceDto } from '../../../models/service.model';
@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [
    ClickOutsideDirective,
    ProgressBarComponent,
    MatIcon,
    ReactiveFormsModule,
  ],
  templateUrl: './service-form.component.html',
  styleUrl: './service-form.component.scss',
})
export class ServiceFormComponent implements OnInit {
  formService = inject(FormService);
  serviceManagementService = inject(ServiceManagementService);
  propertyService = inject(PropertiesService);
  @Output() close = new EventEmitter();
  serviceForm = new FormBuilder().nonNullable.group({
    name: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
    ],
    type: ['' as ServiceType, Validators.required],
    price: [0,[ Validators.required, Validators.pattern('^[0-9]*[.,]?[0-9]{0,2}$')]],
    property: [0 as number  | undefined, Validators.required],
    active: [true, Validators.required],
  });

  serviceTypes: { label: string; value: ServiceType }[] = [
    { label: 'Per Day', value: 'per_day' },
    { label: 'One Time', value: 'one_time' },
  ];

  // TODO: refactor price field to use a custom validator to allow only numbers and commas and set type to text instead of number

  /**
   * Constructor for the ServiceFormComponent.
   *
   * Sets up an effect to update the form fields with the selected service's details
   * when a service is selected and properties are loaded.
   */
  constructor() {
    effect(() => {
      const selected = this.serviceManagementService.selectedService();
      const properties = this.propertyService.properties();
      if (selected !== null && properties.length > 0) {
        this.serviceForm.patchValue({
          name: selected.name,
          type: selected.type,
          price: selected.price,
          property: selected.property,
          active: selected.active,
        });
      }
    });

    effect(
      () => {
        if (this.serviceManagementService.successful()) {
          this.formService.resetForm(this.serviceForm);
          this.closeForm();
        }
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    this.propertyService.loadProperties();
  }
  /**
   * Resets the form to its initial state and closes the form.
   *
   * This function is used to cancel the form and close it.
   * It resets the form to its initial state and sets the selectedService and formOpen
   * signals back to their initial state.
   */
  closeForm = () => {
    this.close.emit();
    this.serviceManagementService.selectedService.set(null);
  };

  /**
   * Creates a new service from the form data and sends it to the server
   * to be saved.
   *
   * This function takes the values from the form, converts the price to a float,
   * and creates a new ServiceDto object that is then passed to the
   * ServiceManagementService.createService method.
   */
  createService() {
    this.serviceManagementService.createService(this.serviceForm.value);
  }

  /**
   * Updates the selected service with the data from the form
   * and saves it to the server.
   */
  updateService() {
    

    this.serviceManagementService.updateService(
      this.serviceForm.value
    );
  }
}
