import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sidenav-toggle',
  standalone: true,
  imports: [],
  templateUrl: './sidenav-toggle.component.html',
  styleUrl: './sidenav-toggle.component.scss',
})
export class SidenavToggleComponent {
  @Input() isOpen = true;
  @Output() toggle = new EventEmitter<void>();
}
