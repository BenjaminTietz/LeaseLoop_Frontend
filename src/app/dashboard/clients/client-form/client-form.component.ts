import { Component, effect, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';
import { ProgressBarComponent } from '../../../shared/global/progress-bar/progress-bar.component';
import { MatIcon } from '@angular/material/icon';
import { FormService } from '../../../services/form-service/form.service';
import { ClientsService } from '../../../services/clients-service/clients.service';
import { ClientDto } from '../../../models/clients.model';
import { Address } from '../../../models/adress.model';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    ClickOutsideDirective,
    ProgressBarComponent,
    MatIcon,
    ReactiveFormsModule,
  ],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss',
})
export class ClientFormComponent {
  formService = inject(FormService);
  clientService = inject(ClientsService);
  @Output() close = new EventEmitter();

  serviceForm = new FormBuilder().nonNullable.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    active: [true],
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

  ngOnInit(){
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  constructor() {
    effect(() => {
      const selected = this.clientService.selectedClient();
      if (selected !== null) {
        this.serviceForm.patchValue({
          first_name: selected.first_name,
          last_name: selected.last_name,
          email: selected.email,
          active: selected.active,
          address: {
            street: selected.address.street,
            house_number: selected.address.house_number,
            postal_code: selected.address.postal_code,
            city: selected.address.city,
            country: selected.address.country,
            phone: selected.address.phone,
          } as Address,
        });
      }
    });
    effect(
      () => {
        if (this.clientService.successful()) {
          this.formService.resetForm(this.serviceForm);
          this.closeForm();
        }
      },
      { allowSignalWrites: true }
    );
  }
  closeForm = () => {
    this.close.emit();
    this.clientService.selectedClient.set(null);
  };

  /**
   * Creates a new client if the selected client is null, otherwise updates the client.
   * @remarks
   * The form data is used to create a new {@link ClientDto} object which is then passed to the
   * {@link ClientsService#createClient} method. If the selected client is null, the
   * {@link ClientsService#createClient} method will create a new client. Otherwise, the
   * {@link ClientsService#updateClient} method will be used to update the client.
   */
  createClient() {
    const raw = this.serviceForm.value;
    const clientData: ClientDto = {
      first_name: raw.first_name,
      last_name: raw.last_name,
      email: raw.email,
      address: {
        street: raw.address?.street,
        house_number: raw.address?.house_number,
        postal_code: raw.address?.postal_code,
        city: raw.address?.city,
        country: raw.address?.country,
        phone: raw.address?.phone,
      } as Address,
    };
    this.clientService.createClient(clientData);
  }

  /**
   * Updates the selected client with the data from the form and sends it to the server.
   * @remarks
   * The form data is used to create a new {@link ClientDto} object which is then passed to the
   * {@link ClientsService#updateClient} method.
   */
  updateClient() {
    const raw = this.serviceForm.value;
    const clientData: ClientDto = {
      first_name: raw.first_name,
      last_name: raw.last_name,
      email: raw.email,
      active: raw.active,
      address: {
        street: raw.address?.street,
        house_number: raw.address?.house_number,
        postal_code: raw.address?.postal_code,
        city: raw.address?.city,
        country: raw.address?.country,
        phone: raw.address?.phone,
      } as Address,
    };
    const id = this.clientService.selectedClient()?.id as number;
    this.clientService.updateClient(clientData);
  }

  /**
   * Checks if the street or house number field has a required error and if
   * either of them are touched or dirty. If either of them is invalid, returns
   * an error message. Otherwise, returns null.
   * @returns {string | null} Error message or null if both fields are valid.
   */
  getStreetErrors() {
    let street = this.serviceForm.get('address')?.get('street');
    let houseNumber = this.serviceForm.get('address')?.get('house_number');
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
   * Checks if the city or postal code field has a required error and if
   * either of them are touched or dirty. If either of them is invalid, returns
   * an error message. Otherwise, returns null.
   * @returns {string | null} Error message or null if both fields are valid.
   */
  getCityErrors() {
    let city = this.serviceForm.get('address')?.get('city');
    let postalCode = this.serviceForm.get('address')?.get('postal_code');
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
    let phone = this.serviceForm.get('address')?.get('phone');
    let country = this.serviceForm.get('address')?.get('country');
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
}
