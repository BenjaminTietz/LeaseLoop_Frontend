import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss',
})
export class FilterComponent {
  @Input() filterBy: { label: string; value: string }[] = [];
  @Output() filterByChange = new EventEmitter<string>();
  selected = '';

  /**
   * Emits the selected filter value to notify subscribers of changes.
   * @param value The filter value selected by the user.
   */
  startFilter(value: string) {
    this.filterByChange.emit(value);
  }
}
