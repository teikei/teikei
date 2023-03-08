import classNames from "classnames";
import React from "react";
import { useFormContext } from "react-hook-form";

interface Props {
  id: string;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password";
}

export const InputField: React.FC<Props> = ({
  id,
  label,
  placeholder,
  type = "text",
}) => {
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
      <input
        id={id}
        className={classNames({
          "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500":
            !errors[id],
          "bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 dark:bg-gray-700 focus:border-red-500 block w-full p-2.5 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500":
            errors[id],
        })}
        type={type}
        placeholder={placeholder}
        {...register(id)}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-500">
          {error.message as string}
        </p>
      )}
    </div>
  );
};
