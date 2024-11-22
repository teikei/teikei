import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useLoaderData } from 'react-router'
import { Link } from 'react-router-dom'
import MyEntriesListItem from '../../components/places/MyEntriesListItem'
import { queryClient } from '../../main'
import { getMyEntriesQuery } from '../../queries/places.queries'
import { NEW_DEPOT, NEW_FARM, NEW_INITIATIVE } from '../../routes'
import { Feature } from '../../types/types'

export const loader = async () => {
  return queryClient.fetchQuery(getMyEntriesQuery())
}

export type LoaderData = Awaited<ReturnType<typeof loader>>

export const Component = () => {
  const { t } = useTranslation()
  const initialData = useLoaderData() as LoaderData

  const myPlacesQuery = useQuery({
    ...getMyEntriesQuery(),
    initialData
  })

  return (
    <div className='entries-editor-container'>
      <section className='entries-list'>
        <h1 className='title'>{t('entries.my_entries')}</h1>
        <ul className='entries-list-controls'>
          <li>
            <Link to={NEW_DEPOT}>{t('entries.new_depot')}</Link>
          </li>
          <li>
            <Link to={NEW_FARM}>{t('entries.new_farm')}</Link>
          </li>
          <li>
            <Link to={NEW_INITIATIVE}>{t('entries.new_initiative')}</Link>
          </li>
        </ul>
        {myPlacesQuery.data?.features &&
        myPlacesQuery.data.features.length > 0 ? (
          myPlacesQuery.data.features.map((feature: Feature) => (
            <MyEntriesListItem key={feature.properties.id} feature={feature} />
          ))
        ) : (
          <div>{t('entries.no_entries')}</div>
        )}
      </section>
    </div>
  )
}

export const ErrorBoundary = Component
