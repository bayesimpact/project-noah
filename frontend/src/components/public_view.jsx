import React from 'react'
import ReactMapboxGl, {Layer, Marker} from 'react-mapbox-gl'
import {Link} from 'react-router'

import config from 'config'
import {store} from 'store/firebase'


// Center of the US.
const START_LOCATION = [-96.328530, 38.321018]


class PublicView extends React.Component {
  static propTypes = {
    hazards: React.PropTypes.array,
    user: React.PropTypes.object,
  };

  render() {
    const {hazards, user} = this.props
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
            center={user && user.location || START_LOCATION}
            containerStyle={mapboxContainerStyle}
            zoom={user && user.location ? [7] : [4]}>
          <Layer type="symbol" id="marker" layout={{'icon-image': 'marker-15'}}>
            {user && user.location ? <Marker coordinates={user.location} /> : null}
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

  handleUpdateLocation = () => {
    this.setState({isRequestingLocation: true})
    navigator.geolocation.getCurrentPosition(location => {
      this.setState({isRequestingLocation: false})
      store.updateUserLocation([location.coords.longitude, location.coords.latitude])
    })
  }

  state = {
    isRequestingLocation: false,
  }

  render() {
    const {user} = this.props
    const {isRequestingLocation} = this.state
    return (
      <div>
        <div>Hola {user.displayName}</div>
        <button onClick={store.logout}>sign out</button>
        <button onClick={this.handleUpdateLocation}>
          {isRequestingLocation ? 'getting location' : 'update my location'}
        </button>
      </div>
    )
  }
}

export {PublicView}
