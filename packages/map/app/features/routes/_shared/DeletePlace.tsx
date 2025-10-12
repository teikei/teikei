import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'
import Alert from 'react-s-alert'
import { getLatitude, getLongitude } from '~/common/geoJsonUtils'
import Loading from '~/components/base/Loading'
import PreviewTile from '~/components/base/PreviewTile'
import { MY_ENTRIES } from '~/lib/routes'
import { deletePlace } from '~/queries/places.api'
import { getPlaceQuery } from '~/queries/places.queries'
import type { PlaceType } from '~/types/types'

interface DeletePlaceProps {
  type: PlaceType
}

const DeletePlace = ({ type }: DeletePlaceProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const placeQuery = useQuery(getPlaceQuery(type, id!))

  const deletePlaceMutation = useMutation({
    mutationFn: async () => {
      const response = await deletePlace({ type, id: id! })
      if (response.properties.id === id) {
        Alert.success(t('places.forms.delete.delete_success'))
      } else {
        throw new Error(t('errors.delete_failed'))
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
            <h1 className='title'>{t('places.forms.delete.title')}</h1>
            <div className='row delete-entry-confirmation'>
              <p>{t('places.forms.delete.confirm_deletion')}</p>
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
                  {t('places.forms.delete.delete')}
                </button>
                <Link to={MY_ENTRIES}>{t('places.forms.delete.cancel')}</Link>
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
