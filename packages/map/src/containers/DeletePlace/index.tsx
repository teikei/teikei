import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'

import PreviewTile from '../../components/PreviewTile/index'
import { getLatitude, getLongitude } from '../../common/geoJsonUtils'
import { MY_ENTRIES } from '../../routes'
import Loading from '../../components/Loading/index'
import { deletePlace, getPlace } from '../../queries/places'
import Alert from 'react-s-alert'
import { PlaceType } from '../../types/types'
import { useNavigate } from 'react-router'

interface DeletePlaceProps {
  type: PlaceType
}

const DeletePlace = ({ type }: DeletePlaceProps) => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const placeQuery = useQuery({
    queryKey: ['getPlace', type, id],
    queryFn: () => getPlace(type, id)
  })

  const deletePlaceMutation = useMutation({
    mutationFn: async () => {
      const response = await deletePlace(type, id)
      if (response.properties.id === id) {
        Alert.success('Dein Eintrag wurde erfolgreich gelöscht.')
      } else {
        throw new Error('Eintrag wurde nicht gelöscht.')
      }
      navigate(MY_ENTRIES)
    },
    onError: (error: Error) => {
      Alert.error(
        `Dein Eintrag konnte nicht gelöscht werden / ${error.message}`
      )
    }
  })

  const place = placeQuery?.data ?? null

  if (place) {
    const {
      properties: { name, city, type }
    } = place
    return (
      <div className='container'>
        <div className='entries-list'>
          <article>
            <h1 className='title'>Eintrag löschen</h1>
            <div className='row delete-entry-confirmation'>
              <p>Möchtest Du diesen Eintrag wirklich löschen?</p>
            </div>
            <div className='entries-list-item row'>
              <div className='entries-list-name seven columns'>
                <h3>{name}</h3>
                <em>{city}</em>
              </div>
              <PreviewTile
                latitude={getLatitude(place)}
                longitude={getLongitude(place)}
                markerIcon={type}
              />
            </div>
            <div className='row'>
              <div id='delete-entry-buttons'>
                <button
                  className='delete-entry button'
                  onClick={() => deletePlaceMutation.mutate()}
                >
                  Löschen
                </button>
                <Link to={MY_ENTRIES}>Abbrechen</Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    )
  }
  return <Loading />
}

export default DeletePlace
