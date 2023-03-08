import React, { useState } from "react";
import { Combobox as HeadlessCombobox } from "@headlessui/react";
import classNames from "classnames";
import { useController } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

import { SearchInput } from "@/components/ui";

export interface ComboboxOption {
  id: number;
  name: string;
}

interface Props {
  id: string;
  label: string;
  placeholder?: string;
  options: ComboboxOption[];
}

const getOptionNameById = (id: number, options: ComboboxOption[]) => {
  const option = options.find((o) => o.id === id);
  return (option && option.name) || "unknown option";
};

export const Combobox: React.FC<Props> = ({
  id,
  label,
  placeholder,
  options,
}) => {
  const {
    field: { onChange, value: selectedOptionIds },
    fieldState: { error },
  } = useController({
    name: id,
  });

  const [query, setQuery] = useState("");

  // TODO fetch async from server instead of filtering here
  const filteredOptions =
    query === ""
      ? []
      : options
          // matches query
          .filter((o) => {
            return o.name.toLowerCase().includes(query.toLowerCase());
          })
          // has not been selected yet
          .filter((o) => !selectedOptionIds.includes(o.id));

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
      <ul className="mb-2">
        {selectedOptionIds.map((id: number) => (
          <li key={id} className="flex items-center mb-2">
            <span className="mr-2 flex-1">
              {getOptionNameById(id, options)}
            </span>
            <FontAwesomeIcon
              className="p-2 hover:grey"
              icon={faXmark}
              pull="right"
              onClick={() =>
                onChange(
                  selectedOptionIds.filter(
                    (selectedId: number) => selectedId !== id
                  )
                )
              }
              size="lg"
            />
          </li>
        ))}
      </ul>
      <HeadlessCombobox
        value={selectedOptionIds}
        by="id"
        onChange={(v: ComboboxOption[]) => onChange(v.map((o) => o.id))}
        multiple
      >
        <HeadlessCombobox.Input
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder || ""}
          as={SearchInput}
        />
        <HeadlessCombobox.Options
          className="md:absolute z-10 font-normal bg-white divide-y divide-gray-100 rounded-lg md:shadow dark:bg-gray-700 dark:divide-gray-600 w-full"
          hidden={filteredOptions.length === 0}
        >
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-400 flex flex-col">
            {filteredOptions.map((option) => (
              <HeadlessCombobox.Option
                key={option.name}
                value={option}
                className="flex-1"
              >
                <a className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                  {option.name}
                </a>
              </HeadlessCombobox.Option>
            ))}
          </ul>
        </HeadlessCombobox.Options>
      </HeadlessCombobox>
    </div>
  );
};
