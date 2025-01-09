import { loader as mapLoader } from '../_shared/MapComponent'
import { MapLibreComponent } from '../_shared/MapLibreComponent.tsx'

export const loader = mapLoader

export const Component = () => <MapLibreComponent />

export const ErrorBoundary = Component
