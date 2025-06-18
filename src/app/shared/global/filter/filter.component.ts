import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss'
})
export class FilterComponent {
  @Input() filterBy: { label: string, value: string }[] = [];
  @Output() filterByChange = new EventEmitter<string>()
  selected = '';

  startFilter(value: string) {
  this.filterByChange.emit(value);
  }
}
