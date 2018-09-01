import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { linkTo } from '@storybook/addon-links'
import { Welcome } from '@storybook/react/demo'
import { Provider } from 'react-redux'
import backgroundColor from 'react-storybook-decorator-background'

import { store } from '../index'
import { UserOnboardingComponent } from '../containers/UserOnboarding'
import Details from '../containers/Details'
import farmMock from './__mocks__/farm.json'
import depotMock from './__mocks__/depot.json'
import initiativeMock from './__mocks__/initiative.json'

import '../styles/site.scss'
import '../styles/app.scss'

const providerDecorator = story => <Provider store={store}>{story()}</Provider>

storiesOf('Welcome', module).add('to Storybook', () => (
  <Welcome showApp={linkTo('Button')} />
))

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
  .addDecorator(backgroundColor(['#253d4c', '#ffffff']))
  .add('depot', () => <Details feature={farmMock}/>)
  .add('farm', () => <Details feature={depotMock}/>)
  .add('initiative', () => <Details feature={initiativeMock}/>)
