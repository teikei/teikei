import classNames from "classnames";
import React from "react";
import { useFormContext } from "react-hook-form";

interface Props {
  id: string;
  placeholder: string;
  type?: "text" | "email" | "password";
}

const InputField: React.FC<Props> = ({ id, placeholder, type = "text" }) => {
  const { register } = useFormContext();
  return (
    <div className="mb-6">
      <label
        htmlFor={id}
        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        Email-Adresse
      </label>
      <div className="control">
        <input
          id={id}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
          focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700
          dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500
          dark:focus:border-blue-500"
          // className={classNames("input", { "is-danger": errors.email })}
          type={type}
          placeholder={placeholder}
          {...register(id)}
        />
        {/*{errors.email && <p className="help is-danger">{errors.email.message}</p>}*/}
      </div>
    </div>
  );
};

export default InputField;
