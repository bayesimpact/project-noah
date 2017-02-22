require('normalize.css/normalize.css')
require('firebaseui/dist/firebaseui.css')

import React from 'react'
import ReactMapboxGl, {Layer, Marker} from 'react-mapbox-gl'
import {Link, browserHistory} from 'react-router'
import firebase from 'firebase'
import firebaseui from 'firebaseui'

import config from 'config'
import configuredFirebase from 'store/firebase'


class AppComponent extends React.Component {
  static propTypes = {
    children: React.PropTypes.element,
  }

  componentWillMount() {
    navigator.geolocation.getCurrentPosition(location => {
      this.setState({location: [location.coords.longitude, location.coords.latitude]})
    })

    configuredFirebase.auth().onAuthStateChanged(user => {
      this.setState({user})
    })
  }

  state = {
    location: [-0.481747846041145, 51.3233379650232],
  }

  render() {
    const {children} = this.props
    const appStyle = {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
    }
    return (
      <div style={appStyle}>
        <h1>Project Noah ⛵</h1>
        <h2>This is going to be amazing!</h2>
        {children && React.cloneElement(children, this.state)}
      </div>
    )
  }
}


class PublicView extends React.Component {
  // TODO: Get rid of the propTypes warning it currently throws, even when an array is given.
  static propTypes = {
    location: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
    user: React.PropTypes.object,
  };

  render() {
    const {location, user} = this.props
    const mapboxContainerStyle = {
      height: '100vh',
      width: '100vw',
    }
    return (
      <div>
        {user ? <UserComponent user={user} /> : <Link to="/login">login or signup</Link>}
        <ReactMapboxGl
            style="mapbox://styles/mapbox/streets-v8"
            accessToken={config.mapboxAccessToken}
            center={location}
            containerStyle={mapboxContainerStyle}>
          <Layer
              type="symbol"
              id="marker"
              layout={{'icon-image': 'marker-15'}}>
            <Marker coordinates={location} />
          </Layer>
        </ReactMapboxGl>
      </div>
    )
  }
}


class UserComponent extends React.Component {
  static propTypes = {
    user: React.PropTypes.object,
  };

  render() {
    const {user} = this.props
    return (
      <div>
        <div>Hola {user.displayName}</div>
        <button onClick={() => configuredFirebase.auth().signOut()}>sign out</button>
      </div>
    )
  }
}


class LoginPage extends React.Component {

  componentDidMount() {
    var uiConfig = {
      callbacks: {
        signInSuccess: () => {
          browserHistory.push('/')
          return false
        },
      },
      'signInOptions': [
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
      ],
      credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    }
    var ui = new firebaseui.auth.AuthUI(configuredFirebase.auth())
    ui.start('#firebaseui-auth-container', uiConfig)
  }

  render() {
    return (
      <div id="firebaseui-auth-container" />
    )
  }
}


export {
  AppComponent,
  LoginPage,
  PublicView,
}
