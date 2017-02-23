require('normalize.css/normalize.css')
require('firebaseui/dist/firebaseui.css')

import React from 'react'
import ReactMapboxGl, {Layer, Marker} from 'react-mapbox-gl'
import {Link} from 'react-router'

import config from 'config'
import {store} from 'store/firebase'


class AppComponent extends React.Component {
  static propTypes = {
    children: React.PropTypes.element,
  }

  componentWillMount() {
    navigator.geolocation.getCurrentPosition(location => {
      this.setState({location: [location.coords.longitude, location.coords.latitude]})
    })

    store.loginChanged(user => this.setState({user}))
    store.getHazards(hazards => this.setState({hazards}))
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
    hazards: React.PropTypes.array,
    location: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
    user: React.PropTypes.object,
  };

  render() {
    const {hazards, location, user} = this.props
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
          <Layer type="symbol" id="marker" layout={{'icon-image': 'marker-15'}}>
            <Marker coordinates={location} />
          </Layer>
          <Layer type="symbol" id="hazards" layout={{'icon-image': 'fire-station-15'}}>
            {(hazards || []).map((coordinates, i) => <Marker key={i} coordinates={coordinates} />)}
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
        <button onClick={store.logout}>sign out</button>
      </div>
    )
  }
}


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


export {
  AppComponent,
  LoginPage,
  PublicView,
}
