import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-sidenav-toggle',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './sidenav-toggle.component.html',
  styleUrl: './sidenav-toggle.component.scss',
})
export class SidenavToggleComponent {
  @Input() isOpen = true;
  @Output() toggle = new EventEmitter<void>();
}
