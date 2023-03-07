import React, { useState } from "react";
import { Combobox as HeadlessCombobox } from "@headlessui/react";
import classNames from "classnames";
import { useMutation } from "react-query";

import { autocomplete } from "@/api/api";
import { LocationSearchResult } from "@/api/apiTypes";
import SearchInput from "@/components/ui/SearchInput";

const suggestionToDisplayValue = (object: LocationSearchResult) => {
  // TODO make sure to never print 'undefined' values
  if (!object) {
    return "";
  }
  const street = object.street ? `${object.street}, ` : "";
  return `${street}${object.postalCode} ${object.city}`;
};

interface Props {
  id: string;
  label: string;
  placeholder?: string;
  onChange: (newValue: LocationSearchResult | null) => void;
  error?: string;
  value: LocationSearchResult | null;
  withEntries?: boolean;
}

const LocationSearchCombobox: React.FC<Props> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
  withEntries = false,
}) => {
  const [autocompletions, setAutocompletions] = useState<
    LocationSearchResult[]
  >([]);
  const autocompleteMutation = useMutation(["autocomplete"], autocomplete, {
    onSuccess: (response) => {
      if (response) {
        setAutocompletions(response);
      }
    },
  });

  return (
    <div className="mb-6 not-prose relative">
      <label
        htmlFor={id}
        className={classNames("block mb-2 text-sm font-medium ", {
          "text-red-700 dark:text-red-500": error,
          "text-gray-900 dark:text-white": !error,
        })}
      >
        {label}
      </label>
      <HeadlessCombobox
        value={value}
        onChange={(value) => onChange(value)}
        nullable
      >
        <HeadlessCombobox.Input
          onChange={(event) =>
            autocompleteMutation.mutate({
              text: event.target.value,
              withEntries,
            })
          }
          displayValue={(option: LocationSearchResult) =>
            suggestionToDisplayValue(option)
          }
          placeholder={placeholder}
          as={SearchInput}
        />
        <HeadlessCombobox.Options
          className="md:absolute z-10 font-normal bg-white divide-y divide-gray-100 rounded-lg md:shadow dark:bg-gray-700 dark:divide-gray-600 w-full"
          hidden={autocompletions.length === 0}
        >
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-400 flex flex-col">
            {autocompletions.map((option) => (
              <HeadlessCombobox.Option
                key={option.id}
                value={option}
                className="flex-1"
              >
                <a className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                  {suggestionToDisplayValue(option)}
                </a>
              </HeadlessCombobox.Option>
            ))}
          </ul>
        </HeadlessCombobox.Options>
      </HeadlessCombobox>
    </div>
  );
};

export default LocationSearchCombobox;
