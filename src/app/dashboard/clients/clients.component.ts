import { Component, inject, OnInit, signal } from '@angular/core';
import { ClientsService } from '../../services/clients-service/clients.service';
import { ClientFormComponent } from './client-form/client-form.component';
import { Clients } from '../../models/clients.model';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [ClientFormComponent],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss',
})
export class ClientsComponent implements OnInit {
  clientService = inject(ClientsService);
  formOpen = signal(false);

  ngOnInit(): void {
    this.clientService.loadClients();
  }

  openForm() {
    this.formOpen.set(true);
    this.clientService.selectedClient.set(null);
    this.clientService.successful.set(false);
  }

  openEditForm(client: Clients) {
    this.clientService.selectedClient.set(client);
    this.formOpen.set(true);
    this.clientService.successful.set(false);
  }
}
