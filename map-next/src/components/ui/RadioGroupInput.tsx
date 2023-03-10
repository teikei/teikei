import React from "react";
import { RadioGroup } from "@headlessui/react";
import { useController } from "react-hook-form";

export interface RadioOption {
  label: string;
  value: string;
}

interface Props {
  name: string;
  label: string;
  options: RadioOption[];
}

export const RadioGroupInput: React.FC<Props> = ({ name, label, options }) => {
  const {
    field: { onChange, value },
  } = useController({
    name,
  });

  return (
    <>
      <label htmlFor={name}>{label}</label>
      <RadioGroup
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <div className="space-y-2">
          {options.map((option) => (
            <RadioGroup.Option
              key={option.value}
              value={option}
              className="flex items-center pl-4 border border-gray-200 rounded dark:border-gray-700"
            >
              {({ checked }) => (
                <div className="flex flex-row items-center">
                  <input
                    id={option.value}
                    type="radio"
                    checked={checked}
                    value={option.value}
                    name={option.value}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500
                   dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700
                   dark:border-gray-600"
                  />
                  <RadioGroup.Label
                    as="div"
                    className="w-full py-4 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                  >
                    <label htmlFor="bordered-radio-1">{option.label}</label>
                  </RadioGroup.Label>
                </div>
              )}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
    </>
  );
};
