import React from 'react'
import ReactMapboxGl, {Layer, Marker} from 'react-mapbox-gl'
import {Link} from 'react-router'
import Paper from 'material-ui/Paper'

import config from 'config'
import {store} from 'store/firebase'


// Center of the US.
const START_LOCATION = [-96.328530, 38.321018]


class PublicView extends React.Component {
  static propTypes = {
    user: React.PropTypes.object,
  };

  componentWillMount() {
    store.getHazards(hazards => this.setState({hazards}))
  }

  state = {}

  render() {
    const {user} = this.props
    const {hazards} = this.state
    const style = {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
    }
    const mapboxContainerStyle = {
      height: '100vh',
      marginTop: 20,
      width: '100vw',
    }
    return (
      <div style={style}>
        {user ? <UserComponent user={user} /> : <Link to="/login">login or signup</Link>}
        <Link style={{alignSelf: 'flex-end', marginRight: 20}} to="admin">Admin View</Link>
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
      store.updateUserProfile({location: [location.coords.longitude, location.coords.latitude]})
    })
  }

  state = {
    isRequestingLocation: false,
  }

  render() {
    const {user} = this.props
    const {isRequestingLocation} = this.state
    const style = {
      padding: 20,
    }
    return (
      <Paper style={style}>
        <div>Hola {user.displayName}</div>
        <UserPhoneNumber user={user} />
        {user.phoneNumber ? <button onClick={this.handleUpdateLocation}>
          {isRequestingLocation ? 'getting location' : 'update my location'}
        </button> : null}
      </Paper>
    )
  }
}


class UserPhoneNumber extends React.Component {
  static propTypes = {
    user: React.PropTypes.object,
  };

  handlePhoneUpdate = () => {
    // TODO: Add validation of the phone number.
    const {phoneNumber} = this.state
    store.updateUserProfile({phoneNumber})
    this.setState({isEditing: false})
  }

  state = {
    isEditing: false,
    phoneNumber: '',
  }

  render() {
    const {user} = this.props
    const {isEditing, phoneNumber} = this.state
    const isEditViewShown = isEditing || !user.phoneNumber
    return (
      <div>
        {isEditViewShown ? <div>
          <div>{user.phoneNumber ? 'Edit ' : 'Add '}phone number</div>
          <div>full phone number with country code, e.g: +33768517681</div>
          <input
              type="text" value={phoneNumber || user.phoneNumber}
              onChange={event => this.setState({phoneNumber: event.target.value})} />
          <button onClick={this.handlePhoneUpdate}>submit</button>
        </div> : <div>
          <span>{user.phoneNumber}</span>
          <button onClick={() => this.setState({isEditing: true, phoneNumber: user.phoneNumber})}>
            edit
          </button>
        </div>}
      </div>
    )
  }
}

export {PublicView}
