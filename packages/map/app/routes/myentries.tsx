import { useTranslation } from 'react-i18next'
import { Link, useLoaderData } from 'react-router'
import { getMyEntriesQuery, useGetMyEntries } from '~/api/get-my-entries'
import MyEntriesListItem from '~/features/entries/components/my-entries-list-item'
import { queryClient } from '~/lib/query-client'
import { requireUser } from '~/lib/require-user'
import { NEW_DEPOT, NEW_FARM, NEW_INITIATIVE } from '~/lib/routes'
import type { Feature } from '~/types/types'

import type { Route } from './+types/myentries'

export const clientLoader = async ({ request }: Route.ClientLoaderArgs) => {
  await requireUser(request)
  return queryClient.fetchQuery(getMyEntriesQuery())
}

export type LoaderData = Awaited<ReturnType<typeof clientLoader>>

export default function MyEntriesRoute() {
  const { t } = useTranslation()
  const initialData = useLoaderData() as LoaderData

  const myPlacesQuery = useGetMyEntries({
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

export function ErrorBoundary() {
  return <div className='entries-editor-container'>Unable to load entries.</div>
}
