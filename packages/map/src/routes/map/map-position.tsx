import { MapComponent, loader as mapLoader } from '../_shared/MapComponent'

export const loader = mapLoader

export const Component = () => <MapComponent mode='position' />

export const ErrorBoundary = Component
