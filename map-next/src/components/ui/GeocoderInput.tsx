import React from "react";

import { useConfig } from "@/main";
import { EntryType } from "@/types";
import AutocompleteCombobox from "@/components/ui/AutocompleteCombobox";

const PREVIEW_TILE_WIDTH = "600";
const PREVIEW_TILE_HEIGHT = "240";
const PREVIEW_TILE_ZOOM_LEVEL = "14";

const tileUrl = (
  assetsBaseUrl: string,
  mapStaticUrl: string,
  latitude: string,
  longitude: string
) => {
  if (!latitude && !longitude) {
    return `url(${assetsBaseUrl}/placeimage-placeholder.png)`;
  }
  return `url(${mapStaticUrl})`
    .replace("{zoom}", PREVIEW_TILE_ZOOM_LEVEL)
    .replace("{width}", PREVIEW_TILE_WIDTH)
    .replace("{height}", PREVIEW_TILE_HEIGHT)
    .replace("{lat}", latitude)
    .replace("{lon}", longitude);
};

const markerUrl = (assetsBaseUrl: string, markerIcon: string) => {
  if (markerIcon) {
    return `${assetsBaseUrl}/marker-${markerIcon.toLowerCase()}.svg`;
  }
  return "";
};

const markerDisplay = (markerIcon: string) => {
  if (markerIcon) {
    return "block";
  }
  return "none";
};

interface Props {
  entryType: EntryType;
}

const GeocoderInput: React.FC<Props> = ({ entryType }) => {
  const { assetsBaseUrl, mapStaticUrl } = useConfig();
  const config = useConfig();

  const latitude = "52.52";
  const longitude = "13.405";

  return (
    <>
      <div
        className="relative h-[240px] mb-1 bg-gray-500 bg-center bg-no-repeat"
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
          className="absolute left-1/2 top-1/2 w-[47px] ml-[-25px] mt-[-57px]"
          src={markerUrl(assetsBaseUrl, entryType)}
          style={{ display: markerDisplay(entryType) }}
          alt="Index Marker Icon"
        />
      </div>
      <AutocompleteCombobox id="geocoder" label="Standort" />
    </>
  );
};

export default GeocoderInput;
