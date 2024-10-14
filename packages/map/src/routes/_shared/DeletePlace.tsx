import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import Alert from 'react-s-alert'
import { useNavigate } from 'react-router'

import PreviewTile from '../../components/base/PreviewTile'
import { getLatitude, getLongitude } from '../../common/geoJsonUtils'
import { MY_ENTRIES } from '../../routes'
import Loading from '../../components/base/Loading'
import { deletePlace } from '../../queries/places.api'
import { PlaceType } from '../../types/types'
import { getPlaceQuery } from '../../queries/places.queries'

interface DeletePlaceProps {
  type: PlaceType
}

const DeletePlace = ({ type }: DeletePlaceProps) => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const placeQuery = useQuery(getPlaceQuery(type, id!!))

  const deletePlaceMutation = useMutation({
    mutationFn: async () => {
      const response = await deletePlace({ type, id: id!! })
      if (response.properties.id === id) {
        Alert.success('Dein Eintrag wurde erfolgreich gelöscht.')
      } else {
        throw new Error('Eintrag wurde nicht gelöscht.')
      }
      navigate(MY_ENTRIES)
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