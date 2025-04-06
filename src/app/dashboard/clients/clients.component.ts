import { Component, inject, OnInit, signal } from '@angular/core';
import { ClientsService } from '../../services/clients-service/clients.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss',
})
export class ClientsComponent implements OnInit {
  cs = inject(ClientsService);

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients() {
    this.cs.loadClients().subscribe({
      next: (data) => {
        this.cs.clients.set(data);
      },
      error: (error) => {
        console.error('Failed to load clients', error);
        // TODO: Handle error appropriately, e.g., show a notification to the user
      },
    });
  }
}
