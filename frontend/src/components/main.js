require('normalize.css/normalize.css')

import React from 'react'
import ReactMapboxGl, {Layer, Marker} from 'react-mapbox-gl'
import {Link} from 'react-router'

import config from 'config'


class AppComponent extends React.Component {
  static propTypes = {
    children: React.PropTypes.element,
  }

  componentWillMount() {
    navigator.geolocation.getCurrentPosition(location => {
      this.setState({location: [location.coords.longitude, location.coords.latitude]})
    })
  }

  state = {
    location: [-0.481747846041145, 51.3233379650232],
  }

  render() {
    const {location} = this.state
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
        {this.props.children && React.cloneElement(this.props.children, {location})}
      </div>
    )
  }
}


class PublicView extends React.Component {
  // TODO: Get rid of the propTypes warning it currently throws, even when an array is given.
  static propTypes = {
    location: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
  };

  render() {
    const {location} = this.props
    const mapboxContainerStyle = {
      height: '100vh',
      width: '100vw',
    }
    return (
      <div>
        <Link to="/login">login or signup</Link>
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


class LoginPage extends React.Component {

  render() {
    return (
      <div>Login/Signup page</div>
    )
  }
}


export {
  AppComponent,
  LoginPage,
  PublicView,
}
