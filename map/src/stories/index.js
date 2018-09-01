import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { linkTo } from '@storybook/addon-links'
import { Welcome } from '@storybook/react/demo'
import { Provider } from 'react-redux'

import { store } from '../index'
import { UserOnboardingComponent } from '../containers/UserOnboarding'

import '../styles/site.scss'
import '../styles/app.scss'

const providerDecorator = story => <Provider store={store}>{story()}</Provider>

storiesOf('Welcome', module)
  .add('to Storybook', () => <Welcome showApp={linkTo('Button')} />)

storiesOf('User Onboarding', module)
  .addDecorator(story => <div className="teikei-embed">{story()}</div>)
  .addDecorator(providerDecorator)
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
