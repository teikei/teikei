import React from "react";
import { Entry } from "@/types";
import { PreviewTile } from "@/components/ui";

interface Props {
  entry: Entry;
}

export const MyEntriesListItem: React.FC<Props> = ({ entry }) => {
  const { name, city, id, type } = entry.properties;
  const [longitude, latitude] = entry.geometry.coordinates;
  return (
    <div className="flex flex-row mb-5">
      <div className="flex-1">
        <h2 className="text-2xl font-extrabold dark:text-white mb-4">{name}</h2>
        <div className="mb-4">{city}</div>
        <ul className="flex flex-wrap mb-6 text-gray-900 dark:text-white">
          <li className="pr-2">
            <a
              className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
              href={`/${type.toLocaleLowerCase()}s/${id}/edit`}
            >
              Bearbeiten
            </a>
          </li>
          |
          <li className="pl-2">
            <a
              className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
              href={`/${type.toLocaleLowerCase()}s/${id}/delete`}
            >
              Löschen
            </a>
          </li>
        </ul>
      </div>
      <PreviewTile latitude={latitude} longitude={longitude} entryType={type} />
    </div>
  );
};
