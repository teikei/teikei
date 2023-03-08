import React, { HTMLProps, Ref } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export const SearchInput = React.forwardRef<
  Ref<HTMLInputElement>,
  HTMLProps<HTMLInputElement>
>(({ ...props }, ref) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </div>
      <input
        type="search"
        id="default-search"
        className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50
        focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400
        dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        autoComplete="off"
        {...props}
        ref={ref as React.Ref<HTMLInputElement>}
      />
    </div>
  );
});
