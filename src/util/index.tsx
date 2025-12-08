import { ReactNode, isValidElement } from "react";

const isOverflowing = (element: HTMLElement | null) =>
  (element && element.scrollHeight > element.clientHeight) || false;

export const findOverflowingParent = (el: HTMLElement | null) => {
  while (el?.parentElement) {
    el = el.parentElement;
    if (isOverflowing(el)) return el;
  }
  return null;
};

export const addChildrenUntil = (
  children: ReactNode[],
  maxChildren: number,
) => {
  const childrenToRender: ReactNode[] = [];

  for (let index = 0; index < children.length; index++) {
    if (index >= maxChildren) break;

    const child = children[index];

    childrenToRender.push(
      <li
        data-testid={`lazy-list-li-${index}`}
        key={((isValidElement(child) && child["key"]) || null) ?? index}
      >
        {child}
      </li>,
    );
  }

  return childrenToRender;
};

export { useHandleScroll } from "./useHandleScroll";
