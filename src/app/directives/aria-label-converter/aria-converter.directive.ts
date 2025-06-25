import {
  Directive,
  ElementRef,
  Renderer2,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';

@Directive({
  selector: '[appAriaConverter]',
  standalone: true,
})
export class AriaConverterDirective implements OnInit, OnDestroy {
  private observer!: MutationObserver;
  private renderer = inject(Renderer2);
  private el = inject(ElementRef);
  constructor() {}

  /**
   * Lifecycle hook that is called after Angular has fully initialized a component.
   * Sets a MutationObserver to watch for changes to the element's child list, subtree, and text content.
   * If a change is detected, it sets the element's aria-label attribute to the element's text content.
   * The MutationObserver is set up to watch for changes to the element's text content, so that it can
   * update the aria-label attribute if the text content changes.
   * The setTimeout call is used to wait 200ms before setting the aria-label attribute, to ensure that
   * the element's text content has been fully rendered before trying to access it.
   */
  ngOnInit(): void {
    setTimeout(() => this.setAriaLabel(), 200);
    this.observer = new MutationObserver(() => this.setAriaLabel());
    this.observer.observe(this.el.nativeElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  /**
   * Sets the aria-label attribute of the element to its text content.
   * It trims and normalizes the text content by replacing one or more whitespace characters with a single space.
   * If the element has no text content, it does not set the aria-label attribute.
   */
  private setAriaLabel(): void {
    const textContent =
      this.el.nativeElement.textContent?.trim().replace(/\s+/g, ' ') || '';
    if (textContent) {
      this.renderer.setAttribute(
        this.el.nativeElement,
        'aria-label',
        textContent
      );
    }
  }

  /**
   * Lifecycle hook that is called when the directive is destroyed.
   * Disconnects the MutationObserver to prevent memory leaks by stopping
   * it from observing changes to the element.
   */

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
