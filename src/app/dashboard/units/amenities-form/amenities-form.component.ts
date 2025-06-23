import {
  Component,
  computed,
  effect,
  EventEmitter,
  inject,
  input,
  Output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AmenitiesService } from '../../../services/amenities-service/amenities.service';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-amenities-form',
  standalone: true,
  imports: [FormsModule, MatIcon, CommonModule],
  templateUrl: './amenities-form.component.html',
  styleUrl: './amenities-form.component.scss',
})
export class AmenitiesFormComponent {
  @Output() closeAmenitiesForm = new EventEmitter<void>();
  @Output() selectedAmenitiesChange = new EventEmitter<number[]>();

  amenityService = inject(AmenitiesService);
  groupedAmenities = signal(this.amenityService.groupedAmenities());
  categoryKeys = computed(() => Object.keys(this.groupedAmenities()));
  selectedAmenities = input<number[]>([]);
  selectedByCategory = signal<Record<string, number[]>>({});
  openCategory = signal<string | null>(null);

  /**
   * Initializes the component by mapping selected amenities to their respective categories.
   *
   * If the `selectedByCategory` map is empty, it populates this map by iterating over each
   * category in the `groupedAmenities`. It filters amenities that are currently selected,
   * and maps their IDs to the respective category. The result is stored in `selectedByCategory`.
   */
  ngOnInit(): void {
    if (Object.keys(this.selectedByCategory()).length === 0) {
      const selectedMap: Record<string, number[]> = {};
      for (const category of Object.keys(this.groupedAmenities())) {
        const idsInCategory = this.groupedAmenities()
          [category].filter((amenity) =>
            this.selectedAmenities().includes(amenity.id)
          )
          .map((amenity) => amenity.id);
        if (idsInCategory.length > 0) {
          selectedMap[category] = idsInCategory;
        }
      }
      this.selectedByCategory.set(selectedMap);
    }
  }

  /**
   * Toggles the selection state of an amenity, given its category and id.
   *
   * @param category The category of the amenity to toggle.
   * @param id The id of the amenity to toggle.
   *
   * This function works by first creating a deep copy of the current selected amenities using
   * `structuredClone`. It then either adds or removes the given `id` from the list of selected
   * amenities in the given `category`, depending on whether or not the id is already present.
   * Finally, it updates the `selectedByCategory` signal with the new state, and emits the
   * updated list of all selected amenities through the `selectedAmenitiesChange` event.
   */
  toggleAmenity(category: string, id: number) {
    const selected = structuredClone(this.selectedByCategory());
    const list = selected[category] ?? [];
    selected[category] = list.includes(id)
      ? list.filter((i) => i !== id)
      : [...list, id];
    this.selectedByCategory.set(selected);
    const allSelectedIds = Object.values(selected).flat();
    this.selectedAmenitiesChange.emit(allSelectedIds);
  }

  /**
   * Updates the selection of amenities in a given category.
   *
   * @param category The category of the amenities to update.
   * @param selected The list of selected amenity IDs as strings.
   *
   * This function works by first mapping the given list of strings to numbers using
   * `map` and the unary plus operator. It then creates a deep copy of the current
   * `selectedByCategory` map using the spread operator. It updates the copy by setting
   * the given `category` key to the list of mapped IDs. Finally, it updates the
   * `selectedByCategory` signal with the new state, and emits the updated list of all
   * selected amenities through the `selectedAmenitiesChange` event.
   */
  updateSelection(category: string, selected: string[]) {
    const ids = selected.map((id) => +id);
    const current = { ...this.selectedByCategory() };
    current[category] = ids;
    this.selectedByCategory.set(current);
    this.selectedAmenitiesChange.emit(Object.values(current).flat());
  }

  /**
   * Toggles the expanded state of a category of amenities, given its key.
   *
   * @param category The key of the category to toggle.
   *
   * If the category is currently open, it will be closed. If the category is
   * currently closed, it will be opened. The state is persisted in the
   * `openCategory` signal.
   */
  toggleCategory(category: string) {
    this.openCategory.set(this.openCategory() === category ? null : category);
  }

  /**
   * Closes the amenities form component and emits an event to the parent
   * component to indicate that the form has been closed.
   */
  closeAmenities() {
    this.closeAmenitiesForm.emit();
  }
}
