import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, computed, input } from '@angular/core';

@Component({
  selector: 'app-paging',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './paging.component.html',
  styleUrl: './paging.component.scss'
})
export class PagingComponent {
   currentPage = input(1);
   totalPages = input(1);
  @Output() pageChanged = new EventEmitter<number>();

  visiblePages = computed(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(this.currentPage() - half, 1);
    let end = Math.min(start + maxVisible - 1, this.totalPages());
    start = Math.max(end - maxVisible + 1, 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageChanged.emit(page);
    }
  }
}
