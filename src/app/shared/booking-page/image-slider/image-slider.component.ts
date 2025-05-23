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

  constructor() {
    effect(() => {
      if (this.autoPlay()) {
        setInterval(() => this.next(), this.interval());
      }
    });
  }

  next() {
    const length = this.images().length;
    this.currentIndex.update((i) => (i + 1) % length);
  }

  prev() {
    const length = this.images().length;
    this.currentIndex.update((i) => (i - 1 + length) % length);
  }
}
