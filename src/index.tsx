import {
  Children,
  FunctionComponent,
  HTMLProps,
  PropsWithChildren,
  ReactNode,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { findOverflowingParent } from "./util";

const DEFAULT_NUMBER_OF_ELEMENTS = 10;
const MARGIN_OF_ERROR = 2; // px

type LazyListProps = {
  /**
   * Initial number of elements to render (10 by default).
   * */
  initialElements?: number;

  /**
   * Number of elements to append (initialElements by default).
   * */
  increment?: number;

  /**
   * Since appending could be an expensive computation, a fallback element
   * can be provided. Usefull for loading indicators.
   * */
  fallback?: ReactNode;

  /**
   *
   * TODO: Think about implementation
   *
   */
  backup?: (fn: () => void) => void;
} & HTMLProps<HTMLUListElement>;

const LazyList: FunctionComponent<PropsWithChildren<LazyListProps>> = ({
  initialElements = DEFAULT_NUMBER_OF_ELEMENTS,
  increment = initialElements,
  fallback,
  children,
  backup,
  ...rest
}) => {
  const [list, setList] = useState<ReactNode[] | null>(() => null);
  const [isLoading, startTransition] = useTransition();

  const containerRef = useRef<HTMLUListElement>(null);
  const childrenRef = useRef(Children.toArray(children));

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

      // reached the bottom - use 2 instead of 1 to give 1px margin of error
      if (Math.abs(scrollHeight - scrollTop - clientHeight) < MARGIN_OF_ERROR)
        addElementsToList();
    },
    [addElementsToList],
  );

  useEffect(() => {
    if (!backup) return;
    backup(() => addElementsToList);
  }, [addElementsToList, backup]);

  // initial render:
  // populate state with elements until elementsRender is reached.
  useEffect(() => {
    const childrenToRender: typeof list = [];
    childrenRef.current.some((child, index) => {
      if (index > initialElements) return true;
      childrenToRender.push(
        <li key={((isValidElement(child) && child["key"]) || null) ?? index}>
          {child}
        </li>,
      );
      return false;
    });
    setList(childrenToRender);
  }, [children, initialElements]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    /* If list is still unchanged, return early since further calculations can only be done after it has been mounted */
    if (list == null) return;

    const element = containerRef.current;
    if (!element) return;

    const parentOverflowing = findOverflowingParent(element);

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

  return (
    <>
      <ul ref={containerRef} {...rest}>
        {list}
      </ul>
      {isLoading && fallback ? fallback : null}
    </>
  );
};

LazyList.displayName = "LazyList";

export default LazyList;
