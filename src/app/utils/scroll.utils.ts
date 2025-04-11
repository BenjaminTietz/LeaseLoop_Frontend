export function disableBackgroundScroll(): void {
  document.body.classList.add('no-scroll');
}

export function enableBackgroundScroll(): void {
  document.body.classList.remove('no-scroll');
}