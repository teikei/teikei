import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { Dialog } from "@headlessui/react";

interface Props {
  title: string;
  text: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmationButtonText?: string;
  cancelButtonText?: string;
}

export const ModalDialog: React.FC<Props> = ({
  title,
  text,
  confirmationButtonText = "Bestätigen",
  cancelButtonText = "Abbrechen",
  isOpen,
  onConfirm,
  onCancel,
}) => (
  <Dialog
    open={isOpen}
    onClose={onCancel}
    as="div"
    className="relative max-w-2xl"
  >
    <div className="bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40"></div>
    <div className="fixed top-0 left-0 right-0 z-50 p-4 justify-center items-center flex h-full overflow-x-hidden overflow-y-auto">
      <Dialog.Panel className="relative bg-white w-full md:w-auto rounded-lg shadow dark:bg-gray-700">
        <Dialog.Title
          className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600"
          as="div"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            onClick={onCancel}
          >
            <FontAwesomeIcon icon={faXmark} />
            <span className="sr-only">Close modal</span>
          </button>
        </Dialog.Title>
        <Dialog.Description as="div">
          <div className="p-6 space-y-6">
            <p className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              {text}
            </p>
          </div>
          <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
            <button
              data-modal-hide="defaultModal"
              type="button"
              className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
              onClick={onConfirm}
            >
              {confirmationButtonText}
            </button>
            <button
              data-modal-hide="defaultModal"
              type="button"
              className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
              onClick={onCancel}
            >
              {cancelButtonText}
            </button>
          </div>
        </Dialog.Description>
      </Dialog.Panel>
    </div>
  </Dialog>
);
