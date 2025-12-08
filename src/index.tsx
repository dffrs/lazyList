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
import { useHandleScroll } from "./util";

const DEFAULT_NUMBER_OF_ELEMENTS = 10;

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
  const childrenRef = useRef(Children.toArray(children));

  const [list, setList] = useState<ReactNode[]>(() => {
    const childrenToRender: ReactNode[] = [];

    childrenRef.current.some((child, index) => {
      if (index >= initialElements) return true;
      childrenToRender.push(
        <li
          data-testid={`lazy-list-li-${index}`}
          key={((isValidElement(child) && child["key"]) || null) ?? index}
        >
          {child}
        </li>,
      );
      return false;
    });
    return childrenToRender;
  });

  const [isLoading, startTransition] = useTransition();

  const addElementsToList = useCallback(() => {
    if (list == null || list.length === childrenRef.current.length) return;
    startTransition(() => {
      const temp = childrenRef.current
        .slice(list.length, list.length + increment)
        .map((e, index) => (
          <li
            data-testid={`lazy-list-li-${index}`}
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

  const ulRef = useHandleScroll<HTMLUListElement>(list, addElementsToList);

  useEffect(() => {
    if (!backup) return;
    backup(() => addElementsToList);
  }, [addElementsToList, backup]);

  return (
    <>
      <ul data-testid="lazy-list-ul" ref={ulRef} {...rest}>
        {list}
      </ul>
      {isLoading && fallback ? (
        <div data-testid="lazy-list-fallback">{fallback}</div>
      ) : null}
    </>
  );
};

LazyList.displayName = "LazyList";

export default LazyList;
