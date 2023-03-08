interface Props {
  text: string;
}

export const SubmitButton: React.FC<Props> = ({ text }) => {
  return (
    <div className="mb-5">
      <button
        type="submit"
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
      >
        {text}
      </button>
    </div>
  );
};
