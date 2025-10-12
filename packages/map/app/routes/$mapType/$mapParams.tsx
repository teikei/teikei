import { clientLoader as mapClientLoader } from '~/features/routes/_shared/MapComponent'
import { MapLibreComponent } from '~/features/routes/_shared/MapLibreComponent'

export const clientLoader = () => mapClientLoader()

export default function MapParamsRoute() {
  return <MapLibreComponent />
}

export function ErrorBoundary() {
  return <MapLibreComponent />
}
