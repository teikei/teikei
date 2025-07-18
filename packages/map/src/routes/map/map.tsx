import { loader as mapLoader } from '@/routes/_shared/MapComponent'
import { MapLibreComponent } from '@/routes/_shared/MapLibreComponent.tsx'

export const loader = mapLoader

export const Component = () => <MapLibreComponent />

export const ErrorBoundary = Component
