import {
  Component,
  effect,
  EventEmitter,
  inject,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';
import { ProgressBarComponent } from '../../../shared/global/progress-bar/progress-bar.component';
import { MatIcon } from '@angular/material/icon';
import { FormService } from '../../../services/form-service/form.service';
import { ClientsService } from '../../../services/clients-service/clients.service';
import { ClientDto } from '../../../models/clients.model';
@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    ClickOutsideDirective,
    ProgressBarComponent,
    MatIcon,
    ReactiveFormsModule,
  ],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss',
})
export class ClientFormComponent implements OnInit {
  formService = inject(FormService);
  clientService = inject(ClientsService);
  @Output() close = new EventEmitter();
  serviceForm = new FormBuilder().nonNullable.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    address: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      const selected = this.clientService.selectedClient();
      const clients = this.clientService.clients();
      if (selected !== null) {
        this.serviceForm.patchValue({
          first_name: selected.first_name,
          last_name: selected.last_name,
          email: selected.email,
          address: selected.address,
        });
      }
    });

    effect(
      () => {
        if (this.clientService.successful()) {
          this.formService.resetForm(this.serviceForm);
          this.closeForm();
        }
      },
      { allowSignalWrites: true }
    );
  }

  closeForm = () => {
    this.close.emit();
    this.clientService.selectedClient.set(null);
  };

  ngOnInit(): void {
    this.clientService.loadClients();
  }

  createClient() {
    const raw = this.serviceForm.value;
    const clientData: ClientDto = {
      first_name: raw.first_name,
      last_name: raw.last_name,
      email: raw.email,
      address: raw.address,
    };

    this.clientService.createClient(clientData);
  }

  updateClient() {
    const raw = this.serviceForm.value;
    const clientData: ClientDto = {
      first_name: raw.first_name,
      last_name: raw.last_name,
      email: raw.email,
      address: raw.address,
    };
    const id = this.clientService.selectedClient()?.id as number;
    this.clientService.updateClient(clientData);
  }
}
