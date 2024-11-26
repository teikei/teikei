import { MapComponent, loader as mapLoader } from '../_shared/MapComponent'

export const loader = mapLoader

export const Component = () => <MapComponent />

export const ErrorBoundary = Component
