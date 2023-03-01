import React, { useState } from "react";
import { Combobox as HeadlessCombobox } from "@headlessui/react";
import classNames from "classnames";
import { useFormContext } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import SearchInput from "./SearchInput";

const people = [
  "Durward Reynolds",
  "Kenton Towne",
  "Therese Wunsch",
  "Benedict Kessler",
  "Katelyn Rohan",
];

interface Props {
  id: string;
  label: string;
  placeholder?: string;
}

const Combobox = ({ id, label, placeholder }: Props) => {
  const {
    formState: { errors },
  } = useFormContext();
  const error = errors && errors[id];

  const [selectedPeople, setSelectedPeople] = useState<string[]>([
    people[0],
    people[1],
  ]);
  const [query, setQuery] = useState("");

  const filteredPeople =
    query === ""
      ? people
      : people.filter((person) => {
          return person.toLowerCase().includes(query.toLowerCase());
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
      <ul className="mb-2">
        {selectedPeople.map((s) => (
          <li key={s} className="flex items-center mb-2">
            <span className="mr-2 flex-1">{s}</span>
            <FontAwesomeIcon
              className="p-2 hover:grey"
              icon={faXmark}
              pull="right"
              onClick={() =>
                setSelectedPeople(selectedPeople.filter((p) => p !== s))
              }
              size="lg"
            />
          </li>
        ))}
      </ul>
      <HeadlessCombobox
        value={selectedPeople}
        onChange={(v) => setSelectedPeople(v)}
        multiple
      >
        <HeadlessCombobox.Input
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder || ""}
          as={SearchInput}
        />
        <HeadlessCombobox.Options className="md:absolute z-10 font-normal bg-white divide-y divide-gray-100 rounded-lg md:shadow dark:bg-gray-700 dark:divide-gray-600 w-full">
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-400 flex flex-col">
            {filteredPeople.map((person) => (
              <HeadlessCombobox.Option
                key={person}
                value={person}
                className="flex-1"
              >
                <a className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                  {person}
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
