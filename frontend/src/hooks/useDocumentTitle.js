import { useEffect } from "react";

/** Sets the browser tab title, restoring the previous value on unmount. */
export default function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} | ShopNest` : "ShopNest";
    return () => {
      document.title = previous;
    };
  }, [title]);
}
