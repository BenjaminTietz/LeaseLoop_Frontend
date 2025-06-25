/**
 * Disables the background scroll by adding the 'no-scroll' class to the body. This
 * class sets the overflow property of the body to 'hidden', effectively disabling
 * background scroll.
 */
export function disableBackgroundScroll(): void {
  document.body.classList.add('no-scroll');
}

/**
 * Enables the background scroll by removing the 'no-scroll' class from the body.
 * This class was added by disableBackgroundScroll() and sets the overflow
 * property of the body to 'hidden', effectively disabling background scroll.
 */
export function enableBackgroundScroll(): void {
  document.body.classList.remove('no-scroll');
}
