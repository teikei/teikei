import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import PreviewTile from '~/components/ds/form/preview-tile'
import Loading from '~/components/ds/loading'
import { MY_ENTRIES } from '~/lib/routes'
import type { Feature } from '~/types/types'
import { getLatitude, getLongitude } from '~/utils/geo-json-utils'

interface DeletePlaceFormProps {
  place: Feature | null
  isLoading?: boolean
  onSubmit: () => void
  isSubmitting?: boolean
}

const DeletePlaceForm = ({
  place,
  isLoading = false,
  onSubmit,
  isSubmitting = false
}: DeletePlaceFormProps) => {
  const { t } = useTranslation()

  if (isLoading || !place) {
    return <Loading />
  }

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
                onClick={onSubmit}
                disabled={isSubmitting}
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

export default DeletePlaceForm
