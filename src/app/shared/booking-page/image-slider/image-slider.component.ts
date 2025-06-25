import { Component, signal, input, effect } from '@angular/core';
import { SliderImage } from '../../../models/slider-image';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-image-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-slider.component.html',
  styleUrl: './image-slider.component.scss',
})
export class ImageSliderComponent {
  images = input<SliderImage[]>([]);
  autoPlay = input(false);
  interval = input(4000);
  currentIndex = signal(0);

  /**
   * Automatically starts the slideshow if autoPlay is true.
   * This is done by setting up an interval that calls next() every interval milliseconds.
   */
  constructor() {
    effect(() => {
      if (this.autoPlay()) {
        setInterval(() => this.next(), this.interval());
      }
    });
  }

  /**
   * Go to the next slide.
   * @remarks
   * If the current index is at the end of the array, it wraps around to the start.
   * This is done by using the modulus operator to get the remainder of the
   * current index divided by the length of the array.
   */
  next() {
    const length = this.images().length;
    this.currentIndex.update((i) => (i + 1) % length);
  }

  /**
   * Go to the previous slide.
   * @remarks
   * If the current index is at the start of the array, it wraps around to the end.
   * This is done by using the modulus operator to get the remainder of the
   * current index divided by the length of the array.
   */
  prev() {
    const length = this.images().length;
    this.currentIndex.update((i) => (i - 1 + length) % length);
  }
}
