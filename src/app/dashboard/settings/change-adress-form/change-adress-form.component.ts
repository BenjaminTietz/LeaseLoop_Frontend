import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';
import { SettingsService } from '../../../services/settings-service/settings.service';
import { FormService } from '../../../services/form-service/form.service';

@Component({
  selector: 'app-change-adress-form',
  standalone: true,
  imports: [MatIcon, CommonModule, ClickOutsideDirective, ReactiveFormsModule],
  templateUrl: './change-adress-form.component.html',
  styleUrl: './change-adress-form.component.scss'
})
export class ChangeAdressFormComponent {
  @Output() close = new EventEmitter()
  settingsService = inject(SettingsService)
  formService = inject(FormService)

  closeForm = () => {
    this.close.emit()
  }

  userData = computed(() => this.settingsService.newUserData())

 

  userForm = new FormBuilder().nonNullable.group({
    tax_id: [this.userData().tax_id || '', [Validators.required]],
    first_name: [this.userData().first_name || '', [Validators.required, Validators.pattern('^[A-Za-z]+(-[A-Za-z]+)?$')]],
    last_name: [ this.userData().last_name || '', [Validators.required, Validators.pattern('^[A-Za-z]+(-[A-Za-z]+)?$')]],	
    address : new FormBuilder().nonNullable.group({
      street: [ this.userData().address.street || '', [Validators.required]],
      house_number: [ this.userData().address.house_number || '', [Validators.required]],
      city: [ this.userData().address.city || '', [Validators.required]],
      country: [ this.userData().address.country || '', [Validators.required]],
      postal_code: [ this.userData().address.postal_code || '', [Validators.required]],
      phone : [ this.userData().address.phone || '', [Validators.required, Validators.pattern('^\\+?[0-9]{3,20}$')]]
    })
  })


  changePersonals(){
    this.settingsService.changePersonals(this.userForm.value);
  }

  get streetErrors() {
    const street = this.userForm.get('address.street');
    const houseNumber = this.userForm.get('address.house_number');
    if (street?.invalid && (street.touched || street.dirty)) {
      if (street.hasError('required')) return 'Street is required';
    }
    if (houseNumber?.invalid && (houseNumber.touched || houseNumber.dirty)) {
      if (houseNumber.hasError('required')) return 'House number is required';
    }
    return '';
  }


  get cityErrors(){
    const city = this.userForm.get('address.city');
    const zipCode = this.userForm.get('address.zip_code');
    if (city?.invalid && (city.touched || city.dirty)) {
      if (city.hasError('required')) return 'City is required';
    }
    if (zipCode?.invalid && (zipCode.touched || zipCode.dirty)) {
      if (zipCode.hasError('required')) return 'Zip code is required';
    }
    return '';
  }

  get countryPhoneErrors(){
    const country = this.userForm.get('address.country');
    const phone = this.userForm.get('address.phone');
    if (country?.invalid && (country.touched || country.dirty)) {
      if (country.hasError('required')) return 'Country is required';
    }
    if (phone?.invalid && (phone.touched || phone.dirty)) {
      if (phone.hasError('required')) return 'Phone is required';
      if (phone.hasError('pattern')) return 'Wrong phone format';
    }
    return '';
  }

  get nameErrors(){
    const firstName = this.userForm.get('first_name');
    const lastName = this.userForm.get('last_name');
    if (firstName?.invalid && (firstName.touched || firstName.dirty)) {
      if (firstName.hasError('required')) return 'First name is required';
      if (firstName.hasError('pattern')) return 'No numbers or special characters allowed';
    }
    if (lastName?.invalid && (lastName.touched || lastName.dirty)) {
      if (lastName.hasError('required')) return 'Last name is required';
      if (lastName.hasError('pattern')) return 'No numbers or special characters allowed';
    }
    return '';
  }

  get taxIdErrors(){
    const taxId = this.userForm.get('tax_id');
    if (taxId?.invalid && (taxId.touched || taxId.dirty)) {
      if (taxId.hasError('required')) return 'Tax ID is required';
    }
    return '';
  }

  closeSuccessPopUp() {
    this.settingsService.successful.set(false)
    this.settingsService.sending.set(false)
    this.userForm.reset()
    this.close.emit()
  }
 
}
