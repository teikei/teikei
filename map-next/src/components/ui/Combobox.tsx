import React, { useState } from "react";
import { Combobox as HeadlessCombobox } from "@headlessui/react";
import classNames from "classnames";
import { useFormContext } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { Feature, Point } from "geojson";

import SearchInput from "./SearchInput";

interface OptionProperties {
  id: string;
  name: string;
}

interface Props<T extends Feature<Point, OptionProperties>> {
  id: string;
  label: string;
  placeholder?: string;
  options: T[];
}

const Combobox = <T extends Feature<Point, OptionProperties>>({
  id,
  label,
  placeholder,
  options,
}: Props<Feature<Point, OptionProperties>>) => {
  const {
    formState: { errors },
  } = useFormContext();
  const error = errors && errors[id];

  const [selectedOptions, setSelectedOptions] = useState<T[]>([]);
  const [query, setQuery] = useState("");

  const filteredOptions =
    query === ""
      ? []
      : options
          .filter((option) => {
            return option.properties.name
              .toLowerCase()
              .includes(query.toLowerCase());
          })
          .filter((option) => !selectedOptions.includes(option));

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
        {selectedOptions.map((option) => (
          <li key={option.properties.id} className="flex items-center mb-2">
            <span className="mr-2 flex-1">{option.properties.name}</span>
            <FontAwesomeIcon
              className="p-2 hover:grey"
              icon={faXmark}
              pull="right"
              onClick={() =>
                setSelectedOptions(
                  selectedOptions.filter((current) => current !== option)
                )
              }
              size="lg"
            />
          </li>
        ))}
      </ul>
      <HeadlessCombobox
        value={selectedOptions}
        onChange={(v) => setSelectedOptions(v)}
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
                key={option.properties.name}
                value={option}
                className="flex-1"
              >
                <a className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                  {option.properties.name}
                </a>
              </HeadlessCombobox.Option>
            ))}
          </ul>
        </HeadlessCombobox.Options>
      </HeadlessCombobox>
    </div>
  );
};

export default Combobox;
