import { loader as mapLoader, MapComponent } from '../_shared/MapComponent'

export const loader = mapLoader

export const Component = () => <MapComponent mode='map' />

export const ErrorBoundary = Component
