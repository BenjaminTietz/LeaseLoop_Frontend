import { Directive, ElementRef, Renderer2, OnInit, OnDestroy, inject } from '@angular/core';

@Directive({
  selector: '[appAriaConverter]',
  standalone: true
})
export class AriaConverterDirective implements OnInit, OnDestroy {
  private observer!: MutationObserver;
  private renderer = inject(Renderer2);
  private el = inject(ElementRef);
  constructor() {}

  ngOnInit(): void {
    setTimeout(() => this.setAriaLabel(), 200);
    this.observer = new MutationObserver(() => this.setAriaLabel());
    this.observer.observe(this.el.nativeElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  private setAriaLabel(): void {
    const textContent = this.el.nativeElement.textContent?.trim().replace(/\s+/g, ' ') || '';
    if (textContent) {
      this.renderer.setAttribute(this.el.nativeElement, 'aria-label', textContent);
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

