import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-amenities-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './amenities-form.component.html',
  styleUrl: './amenities-form.component.scss'
})
export class AmenitiesFormComponent {
  @Output() saveAmenities = new EventEmitter<string[]>();
  @Output() close = new EventEmitter<void>();

  amenityStates: Record<string, boolean> = {
  'Wi-Fi': false,
  'Coffee Maker': false,
  'Air Conditioning': false,
  };


  save() {
  const selected = Object.keys(this.amenityStates).filter(k => this.amenityStates[k]);
  this.saveAmenities.emit(selected);
  }

  get amenityKeys(): string[] {
  return Object.keys(this.amenityStates);
  }

  selectAll() {
  this.amenityStates = this.amenityKeys.reduce((acc, k) => ({ ...acc, [k]: true }), {});
  }

  deselectAll() {
  this.amenityStates = this.amenityKeys.reduce((acc, k) => ({ ...acc, [k]: false }), {});
  }

  cancel() {
  this.close.emit();
  }
}
