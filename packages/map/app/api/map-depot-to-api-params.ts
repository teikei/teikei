import type { FeatureCollection } from '~/types/types'

type FarmReference = {
  id: string
}

const extractFarmIds = (farms: unknown): string[] => {
  if (!farms) {
    return []
  }

  if (Array.isArray(farms)) {
    return farms
      .map((farm) => {
        if (typeof farm === 'string') {
          return farm
        }

        if (farm && typeof farm === 'object' && 'id' in farm) {
          return (farm as FarmReference).id
        }

        return undefined
      })
      .filter((id): id is string => Boolean(id))
  }

  if (typeof farms === 'object' && farms !== null && 'features' in farms) {
    const featureCollection = farms as FeatureCollection
    return featureCollection.features.map((feature) => feature.properties.id)
  }

  return []
}

export const mapDepotToApiParams = <T extends { farms?: unknown }>(
  depot: T
) => ({
  ...depot,
  farms: extractFarmIds(depot.farms)
})
