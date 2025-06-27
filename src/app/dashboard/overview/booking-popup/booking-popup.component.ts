import { Component, inject } from '@angular/core';
import { DashboardService } from '../../../services/dashboard-service/dashboard.service';
import { MatIcon } from '@angular/material/icon';
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';

@Component({
  selector: 'app-booking-popup',
  standalone: true,
  imports: [MatIcon, ClickOutsideDirective],
  templateUrl: './booking-popup.component.html',
  styleUrl: './booking-popup.component.scss',
})
export class BookingPopupComponent {
  dashboardService = inject(DashboardService);

  closePopup = () => {
    this.dashboardService.isbookingPopupOpen.set(false);
  };

  ngOnInit(){
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}
