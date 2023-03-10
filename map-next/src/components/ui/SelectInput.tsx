import React, { Fragment, PropsWithChildren, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useController } from "react-hook-form";

type Primitive = string | number | boolean;

interface SelectOption<T extends Primitive> {
  value: T;
  label: string;
}

interface Props<T extends Primitive> {
  name: string;
  label: string;
  options: SelectOption<T>[];
}

export const SelectInput = <T extends Primitive>({
  name,
  label,
  options,
}: Props<T>) => {
  const {
    field: { onChange: onFormChange },
  } = useController({
    name,
  });

  const [selectedOption, setSelectedOption] = useState<SelectOption<T> | null>(
    null
  );

  const onChange = (newSelectedOption: SelectOption<T> | null) => {
    setSelectedOption(newSelectedOption);
    onFormChange(newSelectedOption ? newSelectedOption.value : null);
  };

  return (
    <div className="flex flex-col w-full">
      <label htmlFor={name}>{label}</label>
      <Listbox value={selectedOption} onChange={onChange}>
        <div className="relative mt-1">
          <Listbox.Button
            className="bg-gray-50 border border-gray-300 text-gray-900 text-left text-sm rounded-lg
            focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600
            dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 min-h-[42px]"
          >
            <span className="block truncate">{selectedOption?.label}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <FontAwesomeIcon icon={faChevronDown} />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg
            ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
            >
              {options.map((option) => (
                <Listbox.Option
                  key={String(option.value)}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-blue-100 text-blue-500" : "text-gray-900"
                    }`
                  }
                  value={option}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {option.label}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-500">
                          <FontAwesomeIcon icon={faCheck} />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};
