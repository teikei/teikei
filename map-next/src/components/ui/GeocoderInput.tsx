import SearchInput from "./SearchInput";
import { useConfig } from "../../main";

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
  markerIcon: string; // TODO
}

const GeocoderInput: React.FC<Props> = ({ markerIcon }) => {
  const { assetsBaseUrl, mapStaticUrl } = useConfig();
  const latitude = "52.52";
  const longitude = "13.405";

  return (
    <>
      <div
        className="preview-map"
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
          className="preview-marker leaflet-marker-icon"
          src={markerUrl(assetsBaseUrl, markerIcon)}
          style={{ display: markerDisplay(markerIcon) }}
          alt="Index Marker Icon"
        />
      </div>
      <SearchInput />
    </>
  );
};

export default GeocoderInput;
