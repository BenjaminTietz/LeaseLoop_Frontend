import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { NavigatorService } from '../../services/navigator/navigator.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent {
  @Input () isOpen = true;
  @Output() closeNav = new EventEmitter()
  navigator = inject(NavigatorService);
  auth = inject(AuthService);

  close(){
    this.closeNav.emit()
  }

  navigateAndClose(path: string): void {
  this.navigator.navigateTo(path);
  this.close();
}
}
