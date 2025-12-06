import { ReactNode, useCallback, useEffect, useRef } from "react";
import { findOverflowingParent } from ".";

const MARGIN_OF_ERROR = 2; // px

export const useHandleScroll = <T extends HTMLElement>(
  list: ReactNode[] | null,
  onAddElement: () => void,
) => {
  const containerRef = useRef<T>(null);

  const onScroll = useCallback(
    (element: HTMLElement | null) => {
      if (!element) return;
      const { clientHeight, scrollHeight, scrollTop } = element;

      // reached the bottom - use 2 instead of 1 to give 1px margin of error
      if (Math.abs(scrollHeight - scrollTop - clientHeight) < MARGIN_OF_ERROR)
        onAddElement();
    },
    [onAddElement],
  );

  useEffect(() => {
    // does this even make sense ?
    if (typeof globalThis === "undefined") return;

    // If list is still unchanged, return early
    // since further calculations can only be done after it has been mounted
    if (list == null) return;

    const element = containerRef.current;
    if (!element) return;

    const parentOverflowing = findOverflowingParent(element);

    // until parent has space for its children, keep adding them
    if (!parentOverflowing) return onAddElement();

    const handleScroll = () => onScroll(parentOverflowing);

    const elementToAddEvent = (() => {
      // if found Root element return window reference
      if (parentOverflowing?.parentElement == null) return globalThis;
      return parentOverflowing;
    })();

    elementToAddEvent.addEventListener("scroll", handleScroll);
    globalThis.addEventListener("resize", handleScroll);

    return () => {
      elementToAddEvent.removeEventListener("scroll", handleScroll);
      globalThis.removeEventListener("resize", handleScroll);
    };
  }, [onAddElement, list, onScroll]);

  return containerRef;
};
