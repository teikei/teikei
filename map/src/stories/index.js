import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { Provider } from 'react-redux'

import { store } from '../index'
import { UserOnboardingComponent } from '../containers/UserOnboarding'
import { MyEntriesList } from '../containers/MyEntries'
import Details from '../containers/Details'
import { NavigationComponent } from '../containers/Navigation'
import farmMock from './__mocks__/farm.json'
import depotMock from './__mocks__/depot.json'
import initiativeMock from './__mocks__/initiative.json'
import entriesMock from './__mocks__/entries'

import '../styles/site.scss'
import '../styles/app.scss'
import NetworkDetails, { NetworkConcepts, NetworkHeader, NetworkOffer } from '../components/NetworkDetails'

const providerDecorator = story => <Provider store={store}>{story()}</Provider>

const decoratedStoriesOf = (name, module) =>
  storiesOf(name, module)
    .addDecorator(story => <div className="teikei-embed">{story()}</div>)
    .addDecorator(providerDecorator)

decoratedStoriesOf('User Onboarding', module)
  .add('sign in', () => (
    <UserOnboardingComponent
      signUp={false}
      onSignInSubmit={action('sign in submitted')}
    />
  ))
  .add('sign up', () => (
    <UserOnboardingComponent
      signUp={true}
      onSignUpSubmit={action('sign up submitted')}
    />
  ))

decoratedStoriesOf('Details', module)
  .add('depot', () => <Details feature={depotMock} />)
  .add('farm', () => <Details feature={farmMock} />)
  .add('initiative', () => <Details feature={initiativeMock} />)

decoratedStoriesOf('MyEntriesList', module)
  .add('empty', () => <MyEntriesList features={[]} />)
  .add('farms, depots, initiatives', () => (
    <MyEntriesList features={entriesMock.features} />
  ))

decoratedStoriesOf('Navigation', module)
  .add('guest', () => <NavigationComponent loggedIn={false} />)
  .add('logged in', () => (
    <NavigationComponent loggedIn={true} username="Jane Doe" />
  ))

storiesOf('Network Details', module)
  .add('default', () => <NetworkDetails />)
