import { Component, inject, OnInit } from '@angular/core';
import { PromocodeService } from '../../services/promocode-service/promocode.service';

@Component({
  selector: 'app-promocodes',
  standalone: true,
  imports: [],
  templateUrl: './promocodes.component.html',
  styleUrl: './promocodes.component.scss',
})
export class PromocodesComponent implements OnInit {
  pcs = inject(PromocodeService);

  ngOnInit(): void {
    this.loadPromocodes();
  }

  loadPromocodes() {
    this.pcs.loadPromocodes().subscribe({
      next: (data) => {
        this.pcs.promocodes.set(data);
      },
      error: (error) => {
        console.error('Failed to load promocodes', error);
        // TODO: Handle error appropriately, e.g., show a notification to the user
      },
    });
  }
}
