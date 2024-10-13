import { loader as mapLoader, MapComponent } from '../_shared/MapComponent'

export const loader = mapLoader

export const Component = () => <MapComponent mode='place' />

export const ErrorBoundary = Component
