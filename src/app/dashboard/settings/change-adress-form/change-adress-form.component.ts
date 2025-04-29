import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-change-adress-form',
  standalone: true,
  imports: [MatIcon, CommonModule],
  templateUrl: './change-adress-form.component.html',
  styleUrl: './change-adress-form.component.scss'
})
export class ChangeAdressFormComponent {
  @Output() close = new EventEmitter()

  closeForm() {
    this.close.emit()
  }
}
