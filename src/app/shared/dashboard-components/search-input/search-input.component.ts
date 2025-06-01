import { CommonModule } from '@angular/common';
import { Component, computed, effect, EventEmitter, Input, model, Output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss'
})
export class SearchInputComponent {
  searchControl = new FormControl<string>('', { nonNullable: true });
  searchValue = toSignal(this.searchControl.valueChanges, { initialValue: '' });

  @Output() searchTerm = new EventEmitter<string>();

  @Input() placeholder = 'Search';

  validSearch = computed(() => (this.searchValue() ?? '').length >= 1);

  constructor() {
    effect(() => {
      if (this.validSearch()) {
        this.searchTerm.emit(this.searchValue());
      }else if(this.searchValue().length === 0){
        this.searchTerm.emit('');
      }
    });
  }
}


