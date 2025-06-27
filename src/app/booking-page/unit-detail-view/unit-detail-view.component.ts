import { Component, computed, inject, signal } from '@angular/core';
import { ImageSliderComponent } from '../../shared/booking-page/image-slider/image-slider.component';
import { CommonModule } from '@angular/common';
import { ClientBookingService } from '../../services/client-booking/client-booking.service';
import { ActivatedRoute } from '@angular/router';
import { BookingPopupComponent } from '../booking-popup/booking-popup.component';
import { NavigatorService } from '../../services/navigator/navigator.service';
import { disableBackgroundScroll, enableBackgroundScroll } from '../../utils/scroll.utils';

@Component({
  selector: 'app-unit-detail-view',
  standalone: true,
  imports: [ImageSliderComponent, CommonModule, BookingPopupComponent],
  templateUrl: './unit-detail-view.component.html',
  styleUrl: './unit-detail-view.component.scss',
})
export class UnitDetailViewComponent {
  bookingService = inject(ClientBookingService);
  navigator = inject(NavigatorService);
  route = inject(ActivatedRoute);

  unitId = signal<number | undefined>(undefined);
  unit = computed(() =>
    this.bookingService.units().find((u) => u.id === this.unitId())
  );

  property = computed(() => {
    const unit = this.unit();
    if (!unit) return null;
    return this.bookingService
      .properties()
      .find((p) => p.id === unit.property.id);
  });

  showPopup = signal(false);

  unitImages = computed(() => this.unit()?.images ?? []);

  /**
   * Initializes the component by subscribing to route parameter changes.
   * Extracts the 'unitId' from the route parameters and sets the unitId signal.
   */

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('unitId'));
      if (!isNaN(id)) this.unitId.set(id);
    });
  }

  /**
   * Scrolls to the top of the page when the component is initialized.
   * Used to reset the scroll position when navigating to a unit detail view.
   */
  ngOnInit(){
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Opens the booking popup.
   * Sets the `showPopup` signal to `true` which shows the booking popup in the template.
   */
  openBookingPopup() {
    this.showPopup.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    disableBackgroundScroll()
  }

  closeBookingPopup = () => {
    this.showPopup.set(false);
    enableBackgroundScroll();
  };

}

