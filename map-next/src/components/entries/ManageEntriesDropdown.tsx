import React, { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";

export const ManageEntriesDropdown: React.FC = () => {
  return (
    <>
      <Popover as={Fragment}>
        {({ open }) => (
          <>
            <Popover.Button
              className="flex items-center justify-between w-full py-2 pl-3 pr-4 font-medium text-gray-700 rounded hover:bg-gray-100
            md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto dark:text-gray-400 dark:hover:text-white dark:focus:text-white
            dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
            >
              <span>Einträge hinzufügen/bearbeiten</span>
              <span className="icon is-small ml-2">
                <FontAwesomeIcon icon={faAngleDown} />
              </span>
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="opacity-0 scale-90"
              enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-90"
            >
              <Popover.Panel
                className="md:absolute z-10 font-normal bg-white divide-y divide-gray-100 rounded-lg md:shadow md:w-60 dark:bg-gray-700 dark:divide-gray-600"
                id="dropdown-menu"
                role="menu"
              >
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-400">
                  <li>
                    <a
                      href="/myentries"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Meine Einträge
                    </a>
                  </li>
                  <li>
                    <a
                      href="/depots/new"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Abholstelle hinzufügen
                    </a>
                  </li>
                  <li>
                    <a
                      href="/farms/new"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Betrieb hinzufügen
                    </a>
                  </li>
                  <li>
                    <a
                      href="/initiatives/new"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Initiative hinzufügen
                    </a>
                  </li>
                </ul>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </>
  );
};

export default ManageEntriesDropdown;
