import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  EventEmitter,
  Input,
  model,
  Output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss',
})
export class SearchInputComponent {
  searchControl = new FormControl<string>('', { nonNullable: true });
  searchValue = toSignal(this.searchControl.valueChanges, { initialValue: '' });

  @Output() searchTerm = new EventEmitter<string>();
  @Input() placeholder = 'Search';

  validSearch = computed(() => (this.searchValue() ?? '').length >= 1);

  /**
   * Initializes the SearchInputComponent.
   *
   * Sets up an effect to monitor changes in the search input value. Emits the search term when it is valid (length >= 1),
   * or emits an empty string when the search value is cleared.
   */
  constructor() {
    effect(() => {
      if (this.validSearch()) {
        this.searchTerm.emit(this.searchValue());
      } else if (this.searchValue().length === 0) {
        this.searchTerm.emit('');
      }
    });
  }
}
