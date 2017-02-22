import 'core-js/fn/object/assign'
import React from 'react'
import ReactDOM from 'react-dom'
import {AppComponent, PublicView, LoginPage} from './components/main'

import {Router, browserHistory} from 'react-router'


const routes = {
  path: '/',
  component: AppComponent,
  indexRoute: {
    component: PublicView,
  },
  childRoutes: [
    {
      path: 'login',
      component: LoginPage,
    },
  ],
}


class MyRouter extends React.Component {

  render() {
    return <Router history={browserHistory} routes={routes} />
  }
}

// Render the main component into the dom.
ReactDOM.render(<MyRouter />, document.getElementById('app'))
