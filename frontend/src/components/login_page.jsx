require('firebaseui/dist/firebaseui.css')

import React from 'react'

import {store} from 'store/firebase'


// TODO: Fix styling of login page that became a bit ugly with the uswds styling.
class LoginPage extends React.Component {

  componentDidMount() {
    store.startFirebaseUi('#firebaseui-auth-container', {redirectUrl: '/'})
  }

  render() {
    return (
      <div id="firebaseui-auth-container" />
    )
  }
}

export {LoginPage}
