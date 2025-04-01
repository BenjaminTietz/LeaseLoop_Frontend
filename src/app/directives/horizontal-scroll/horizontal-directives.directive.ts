import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHorizontalDirectives]',
  standalone: true
})
export class HorizontalDirectivesDirective {
  private isHovering = false;
  private hasOverflow = false;
  constructor(private el: ElementRef, private renderer: Renderer2) { }

  @HostListener('mouseenter')
  /**
   * When the mouse enters the element, check if there is an overflow
   * and set the flag for hover status.
   */
  onMouseEnter() {
    this.checkOverflow();
    this.isHovering = true;
  }

  @HostListener('mouseleave')
  /**
   * When the mouse leaves the element, reset the hover status.
   */
  onMouseLeave() {
    this.isHovering = false;
  }

  @HostListener('window:resize')
  /**
   * Listener for window resize events.
   * Re-evaluates overflow status when the window is resized.
   */
  onResize() {
    this.checkOverflow();
  }

  @HostListener('wheel', ['$event'])
  /**
   * When the user scrolls the mouse wheel and the element is currently being hovered and
   * has overflow content, this function will scroll the element horizontally by the
   * deltaY value of the wheel event. Also prevents the default scroll behavior.
   * @param event WheelEvent object
   */
  onScroll(event: WheelEvent) {
    if (this.isHovering && this.hasOverflow) {
      this.el.nativeElement.scrollLeft += event.deltaY;
      event.preventDefault();
    }
  }

  /**
   * Checks if the element has content overflowing its horizontal boundaries.
   * Sets the hasOverflow flag to true if overflow is detected; otherwise, false.
   * Adds or removes the 'has-overflow' class based on the overflow status.
   */
  private checkOverflow(): void {
    const element = this.el.nativeElement;
    this.hasOverflow = element.scrollWidth > element.clientWidth;
    if (this.hasOverflow) {
      this.renderer.addClass(element, 'has-overflow');
    } else {
      this.renderer.removeClass(element, 'has-overflow');
    }
  }

}
