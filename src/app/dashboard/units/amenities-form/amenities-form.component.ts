import { HttpClient } from '@angular/common/http';
import { Component, computed, effect, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AmenitiesService } from '../../../services/amenities-service/amenities.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-amenities-form',
  standalone: true,
  imports: [FormsModule, MatIcon],
  templateUrl: './amenities-form.component.html',
  styleUrl: './amenities-form.component.scss'
})
export class AmenitiesFormComponent {
  @Output() closeAmenitiesForm = new EventEmitter<void>();
  @Output() selectedAmenitiesChange = new EventEmitter<number[]>();

  amenityService = inject(AmenitiesService);
  groupedAmenities = signal(this.amenityService.groupedAmenities())
  categoryKeys = computed(() => Object.keys(this.groupedAmenities()));
  selectedAmenities = input<number[]>([]);
  selectedByCategory = signal<Record<string, number[]>>({});
  openCategory = signal<string | null>(null);

  ngOnInit(): void {
  if (Object.keys(this.selectedByCategory()).length === 0) {
    const selectedMap: Record<string, number[]> = {};

    for (const category of Object.keys(this.groupedAmenities())) {
      const idsInCategory = this.groupedAmenities()[category]
        .filter(amenity => this.selectedAmenities().includes(amenity.id))
        .map(amenity => amenity.id);

      if (idsInCategory.length > 0) {
        selectedMap[category] = idsInCategory;
      }
    }
    this.selectedByCategory.set(selectedMap);
  }
  }

  toggleAmenity(category: string, id: number) {
  const selected = structuredClone(this.selectedByCategory());
  const list = selected[category] ?? [];

  selected[category] = list.includes(id)
    ? list.filter(i => i !== id)
    : [...list, id];

  this.selectedByCategory.set(selected);
  const allSelectedIds = Object.values(selected).flat();
  this.selectedAmenitiesChange.emit(allSelectedIds);
  }


  updateSelection(category: string, selected: string[]) {
  const ids = selected.map(id => +id);
  const current = { ...this.selectedByCategory() };
  current[category] = ids;
  this.selectedByCategory.set(current);
  this.selectedAmenitiesChange.emit(Object.values(current).flat());
  } 
  toggleCategory(category: string) {
    this.openCategory.set(this.openCategory() === category ? null : category);
  }

  closeAmenities() {
    this.closeAmenitiesForm.emit();
  }
}
