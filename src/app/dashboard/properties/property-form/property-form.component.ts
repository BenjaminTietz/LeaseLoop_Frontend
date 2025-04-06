import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { FormService } from '../../../services/form-service/form.service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './property-form.component.html',
  styleUrl: './property-form.component.scss'
})
export class PropertyFormComponent {
  formService = inject(FormService);

  propertyForm  = new FormBuilder().nonNullable.group({
    name: [''],
    address: [''],
    description: ['']
  })
}
