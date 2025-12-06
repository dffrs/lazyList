import {
  Children,
  FunctionComponent,
  HTMLProps,
  PropsWithChildren,
  ReactNode,
  isValidElement,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

const findParent = (
  el: HTMLElement | null,
  predicate: (parentElement: HTMLElement | null) => boolean,
) => {
  while (el?.parentElement) {
    el = el.parentElement;
    if (predicate(el)) return el;
  }
  return null;
};
const isOverflowing = (element: HTMLElement | null) =>
  (element && element.scrollHeight > element.clientHeight) || false;
interface ScrollerProps extends HTMLProps<HTMLUListElement> {
  elementsRendered?: number;
  increment?: number;
  fallback?: ReactNode;
  backup?: (fn: () => void) => void;
}
const LazyList: FunctionComponent<PropsWithChildren<ScrollerProps>> = ({
  elementsRendered = 15,
  increment = elementsRendered,
  fallback,
  children,
  backup,
  ...rest
}) => {
  const [list, setList] = useState<ReactNode[] | null>(() => null);
  const containerRef = useRef<HTMLUListElement>(null);
  const childrenRef = useRef(Children.toArray(children));
  const [isLoading, startTransition] = useTransition();

  const addElementsToList = useCallback(() => {
    if (list == null || list.length === childrenRef.current.length) return;
    startTransition(() => {
      const temp = childrenRef.current
        .slice(list.length, list.length + increment)
        .map((e, index) => (
          <li
            key={
              ((isValidElement(e) && e["key"]) || null) ?? list.length + index
            }
          >
            {e}
          </li>
        ));
      setList((old) => [...(old ?? []), ...temp]);
    });
  }, [increment, list]);

  const onScroll = useCallback(
    (element: HTMLElement | null) => {
      if (!element) return;
      const { clientHeight, scrollHeight, scrollTop } = element;
      /* Reached the bottom - use 2 instead of 1 to give 1px margin of error */
      if (Math.abs(scrollHeight - scrollTop - clientHeight) < 2)
        addElementsToList();
    },
    [addElementsToList],
  );

  useEffect(() => {
    if (!backup) return;
    backup(() => addElementsToList);
  }, [addElementsToList, backup]);

  /* 
    Initial render: 
    Populate state with elements until elementsRender is reached.
  */
  useEffect(() => {
    const childrenToRender: typeof list = [];
    childrenRef.current.some((child, index) => {
      if (index > elementsRendered) return true;
      childrenToRender.push(
        <li key={((isValidElement(child) && child["key"]) || null) ?? index}>
          {child}
        </li>,
      );
      return false;
    });
    setList(childrenToRender);
  }, [children, elementsRendered]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    /* If list is still unchanged, return early since further calculations can only be done after it has been mounted */
    if (list == null) return;
    const element = containerRef.current;
    if (!element) return;
    const parentOverflowing = findParent(element, isOverflowing);
    /* Until parent has space for its children, keep adding them */
    if (!parentOverflowing) return addElementsToList();
    const handleScroll = () => onScroll(parentOverflowing);
    const elementToAddEvent = (() => {
      /* If found Root element return window reference */
      if (parentOverflowing?.parentElement == null) return window ?? null;
      return parentOverflowing;
    })();
    elementToAddEvent.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    return () => {
      elementToAddEvent.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [addElementsToList, list, onScroll]);

  useEffect(() => {
    console.log("list", list);
  }, [list]);

  return (
    <>
      <ul
        ref={containerRef}
        style={{
          listStyle: "none",
          width: "100%",
          marginLeft: "0",
          marginRight: "0",
        }}
        {...rest}
      >
        {list}
      </ul>
      {(isLoading && (fallback ?? <></>)) || <></>}
    </>
  );
};

LazyList.displayName = "LazyList";

export default memo(LazyList);
