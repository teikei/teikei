import { clientLoader as mapClientLoader } from '~/features/map/components/map-component'
import { MapLibreComponent } from '~/features/map/components/map-libre-component'

export const clientLoader = () => mapClientLoader()

export default function MapParamsRoute() {
  return <MapLibreComponent />
}

export function ErrorBoundary() {
  return <MapLibreComponent />
}
