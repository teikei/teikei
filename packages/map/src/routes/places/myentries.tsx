import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useLoaderData } from 'react-router'

import i18n from '../../i18n'
import MyEntriesListItem from '../../components/places/MyEntriesListItem'
import { NEW_DEPOT, NEW_FARM, NEW_INITIATIVE } from '../../routes'
import { getMyPlacesQuery } from '../../queries/places.queries'
import { queryClient } from '../../App'
import { Feature } from '../../types/types'

export const loader = async () => {
  return queryClient.fetchQuery(getMyPlacesQuery())
}

export type LoaderData = Awaited<ReturnType<typeof loader>>

export const Component = () => {
  const initialData = useLoaderData() as LoaderData

  const myPlacesQuery = useQuery({
    ...getMyPlacesQuery(),
    initialData
  })

  return (
    <div className='entries-editor-container'>
      <section className='entries-list'>
        <h1 className='title'>{i18n.t('entries.my_entries')}</h1>
        <ul className='entries-list-controls'>
          <li>
            <Link to={NEW_DEPOT}>{i18n.t('entries.new_depot')}</Link>
          </li>
          <li>
            <Link to={NEW_FARM}>{i18n.t('entries.new_farm')}</Link>
          </li>
          <li>
            <Link to={NEW_INITIATIVE}>{i18n.t('entries.new_initiative')}</Link>
          </li>
        </ul>
        {myPlacesQuery.data?.features &&
        myPlacesQuery.data.features.length > 0 ? (
          myPlacesQuery.data.features.map((feature: Feature) => (
            <MyEntriesListItem key={feature.properties.id} feature={feature} />
          ))
        ) : (
          <div>{i18n.t('entries.no_entries')}</div>
        )}
      </section>
    </div>
  )
}

export const ErrorBoundary = Component
