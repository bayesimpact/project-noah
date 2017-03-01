import 'core-js/fn/object/assign'
import React from 'react'
import ReactDOM from 'react-dom'
import {Router, browserHistory} from 'react-router'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import {lightBlue500, lightBlue700, grey400, deepOrangeA200} from 'material-ui/styles/colors'

import {AppComponent} from './components/main'
import {PublicView} from './components/public_view'
import {AdminView} from './components/admin_view'
import {LoginPage} from './components/login_page'
import {store} from 'store/firebase'


function requireAdmin(nextState, replaceState) {
  if (!store.isAdmin) {
    replaceState({}, '/')
  }
}

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
    {
      path: 'admin',
      component: AdminView,
      onEnter: requireAdmin,
    },
  ],
}

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: lightBlue500,
    primary2Color: lightBlue700,
    primary3Color: grey400,
    accent1Color: deepOrangeA200,
  },
})


class MyRouter extends React.Component {

  render() {
    return <MuiThemeProvider muiTheme={muiTheme}>
      <Router history={browserHistory} routes={routes} />
    </MuiThemeProvider>
  }
}

// Render the main component into the dom.
ReactDOM.render(<MyRouter />, document.getElementById('app'))
