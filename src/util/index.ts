const isOverflowing = (element: HTMLElement | null) =>
  (element && element.scrollHeight > element.clientHeight) || false;

export const findOverflowingParent = (el: HTMLElement | null) => {
  while (el?.parentElement) {
    el = el.parentElement;
    if (isOverflowing(el)) return el;
  }
  return null;
};
