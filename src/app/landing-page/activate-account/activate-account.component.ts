import { Component, inject, OnInit } from '@angular/core';
import { NavigatorService } from '../../services/navigator/navigator.service';
import { AuthService } from '../../services/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ProgressBarComponent } from '../../shared/global/progress-bar/progress-bar.component';

@Component({
  selector: 'app-activate-account',
  standalone: true,
  imports: [ProgressBarComponent],
  templateUrl: './activate-account.component.html',
  styleUrl: './activate-account.component.scss',
})
export class ActivateAccountComponent implements OnInit {
  navigator = inject(NavigatorService);
  auth = inject(AuthService);
  route = inject(ActivatedRoute);

  /**
   * Initialize the component by activating the account based on the URL parameters.
   *
   * The URL parameters are expected to contain the user ID and the activation token.
   *
   * The activation process is performed by calling the `activateAccount` method of the
   * `AuthService`.
   */
  ngOnInit(): void {
    const uid = this.route.snapshot.paramMap.get('uid')!;
    const token = this.route.snapshot.paramMap.get('token')!;
    this.auth.activateAccount(uid, token);
  }
}
