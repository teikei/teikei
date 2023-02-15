import React from "react";

function useOutsideClick<T extends Node>(callback: () => void) {
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [ref]);

  return ref;
}
export default useOutsideClick;
