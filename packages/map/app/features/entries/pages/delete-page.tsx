import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'
import Alert from 'react-s-alert'
import { useDeletePlace } from '~/api/delete-place'
import { useGetPlace } from '~/api/get-place'
import PreviewTile from '~/components/ds/form/preview-tile'
import Loading from '~/components/ds/loading'
import { MY_ENTRIES } from '~/lib/routes'
import type { PlaceType } from '~/types/types'
import { getLatitude, getLongitude } from '~/utils/geo-json-utils'

interface DeletePlaceProps {
  type: PlaceType
}

const DeletePlace = ({ type }: DeletePlaceProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const placeQuery = useGetPlace({ type, id: id! }, { enabled: Boolean(id) })

  const deletePlaceMutation = useDeletePlace({
    onSuccess: (response, variables) => {
      if (response.properties.id !== variables.id) {
        Alert.error(t('errors.delete_failed'))
        return
      }

      Alert.success(t('places.forms.delete.delete_success'))
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
                  onClick={() => deletePlaceMutation.mutate({ type, id: id! })}
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
