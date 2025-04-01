import { Component, inject } from '@angular/core';
import { NavigatorService } from '../../shared/services/navigator/navigator.service';


@Component({
  selector: 'app-activate-account',
  standalone: true,
  imports: [],
  templateUrl: './activate-account.component.html',
  styleUrl: './activate-account.component.scss'
})
export class ActivateAccountComponent {
  navigator = inject(NavigatorService);
}
