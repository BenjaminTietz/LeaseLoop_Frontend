import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  @Input() appClickOutside!: () => void;
  constructor(private elementRef: ElementRef) {}
  @HostListener('document:click', ['$event.target'])

  /**
   * This function will be called whenever a click event is captured by the
   * HostListener at the document level. It will check if the click target
   * element is outside the host element, and if so, it will call the
   * function passed to the input property appClickOutside.
   * @param targetElement The element that was clicked on
   */
  onClick(targetElement: HTMLElement): void {
    const isInside = this.elementRef.nativeElement.contains(targetElement);
    if (!isInside && this.appClickOutside) {
      this.appClickOutside();
    }
  }
}
