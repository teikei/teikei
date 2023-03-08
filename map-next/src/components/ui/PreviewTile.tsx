import React from "react";
import classNames from "classnames";
import { useConfig } from "@/clients";
import { EntryType } from "@/types";

const PREVIEW_TILE_WIDTH = "600";
const PREVIEW_TILE_HEIGHT = "240";
const PREVIEW_TILE_ZOOM_LEVEL = "14";

const tileUrl = (
  assetsBaseUrl: string,
  mapStaticUrl: string,
  latitude?: number,
  longitude?: number
) => {
  if (!latitude || !longitude) {
    return `url(${assetsBaseUrl}/placeimage-placeholder.png)`;
  }
  return `url(${mapStaticUrl})`
    .replace("{zoom}", PREVIEW_TILE_ZOOM_LEVEL)
    .replace("{width}", PREVIEW_TILE_WIDTH)
    .replace("{height}", PREVIEW_TILE_HEIGHT)
    .replace("{lat}", latitude.toString())
    .replace("{lon}", longitude.toString());
};

const markerUrl = (assetsBaseUrl: string, markerIcon?: string) => {
  if (!markerIcon) {
    return "";
  }
  return `${assetsBaseUrl}/marker-${markerIcon.toLowerCase()}.svg`;
};

interface Props {
  latitude?: number;
  longitude?: number;
  entryType?: EntryType;
}

export const PreviewTile: React.FC<Props> = ({
  latitude,
  longitude,
  entryType,
}) => {
  const { assetsBaseUrl, mapStaticUrl } = useConfig();

  return (
    <div
      className="relative h-[240px] w-[590px] mb-1 bg-gray-500 bg-center bg-no-repeat"
      style={{
        backgroundImage: tileUrl(
          assetsBaseUrl,
          mapStaticUrl,
          latitude,
          longitude
        ),
      }}
    >
      <img
        className={classNames(
          "absolute left-1/2 top-1/2 w-[47px] ml-[-25px] mt-[-57px]",
          { block: entryType, hidden: !entryType }
        )}
        src={markerUrl(assetsBaseUrl, entryType)}
        alt="Index Marker Icon"
      />
    </div>
  );
};
