import classNames from "classnames";
import React from "react";
import { useFormContext } from "react-hook-form";

interface Props {
  id: string;
  label: string;
  placeholder?: string;
  rows: number;
}

export const Textarea: React.FC<Props> = ({ id, label, placeholder, rows }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors && errors[id];
  return (
    <div className="mb-6">
      <label
        htmlFor={id}
        className={classNames("block mb-2 text-sm font-medium ", {
          "text-red-700 dark:text-red-500": error,
          "text-gray-900 dark:text-white": !error,
        })}
      >
        {label}
      </label>
      <textarea
        id="message"
        rows={rows}
        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300
        focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400
        dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder={placeholder}
        {...register(id)}
      ></textarea>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-500">
          {error.message as string}
        </p>
      )}
    </div>
  );
};
