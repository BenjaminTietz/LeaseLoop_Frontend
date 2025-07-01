import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { disableBackgroundScroll } from '../../../utils/scroll.utils';

@Component({
  selector: 'app-info-overlay',
  standalone: true,
  imports: [],
  templateUrl: './info-overlay.component.html',
  styleUrl: './info-overlay.component.scss'
})
export class InfoOverlayComponent {
  @Input() title: string = '';
  @Input() message: string = '';
  @Output() closeInfo = new EventEmitter<void>();

  ngOnInit() {
    disableBackgroundScroll();
  }

  close = () => {
    this.closeInfo.emit();
  }
}
