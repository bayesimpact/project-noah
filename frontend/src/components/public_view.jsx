import React from 'react'
import ReactMapboxGl, {Layer, Marker} from 'react-mapbox-gl'
import {Link} from 'react-router'
import Paper from 'material-ui/Paper'
import PlacesAutocomplete, {geocodeByAddress} from 'react-places-autocomplete'

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
    if (this.props.user) {
      store.getUserIsAdmin(this.props.user, isAdmin => this.setState({isAdmin}))
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.user) {
      store.getUserIsAdmin(nextProps.user, isAdmin => this.setState({isAdmin}))
    }
  }

  state = {
    isAdmin: false,
  }

  render() {
    const {user} = this.props
    const {hazards, isAdmin} = this.state
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
    const adminLinkStyle = {
      alignSelf: 'flex-end',
      marginRight: 20,
    }
    return (
      <div style={style}>
        {user ? <UserComponent user={user} /> : <Link to="/login">login or signup</Link>}
        {isAdmin ? <Link style={adminLinkStyle} to="admin">Admin View</Link> : null}
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

  render() {
    const {user} = this.props
    const style = {
      padding: 20,
    }
    return (
      <Paper style={style}>
        <div>Hola {user.displayName}</div>
        <UserPhoneNumber user={user} />
        {user.phoneNumber ? <UserLocationSelector address={user.address} /> : null}
      </Paper>
    )
  }
}


class UserLocationSelector extends React.Component {
  static propTypes = {
    address: React.PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      isRequestingLocation: false,
      address: props.address,
    }
  }

  componentWillReceiveProps(nextProps, oldProps) {
    if (nextProps.address !== oldProps.address) {
      this.setState({address: nextProps.address})
    }
  }

  handleBrowserLocationClick = () => {
    this.setState({isRequestingLocation: true})
    navigator.geolocation.getCurrentPosition(location => {
      this.setState({isRequestingLocation: false})
      // TODO: Use reverse geocoding to fill the address field.
      store.updateUserProfile({
        address: `${location.coords.longitude}, ${location.coords.latitude}`,
        location: [location.coords.longitude, location.coords.latitude],
      })
    })
  }


  handlePlacesSelect = (address) => {
    // TODO: Add error handling.
    geocodeByAddress(address,  (err, {lat, lng}) => {
      store.updateUserProfile({
        address,
        location: [lng, lat],
      })
    })
  }

  render() {
    const {address, isRequestingLocation} = this.state
    return (
      <div style={{display: 'flex'}}>
        <div>
          <div>Enter your address</div>
          <PlacesAutocomplete
              value={address}
              onSelect={this.handlePlacesSelect}
              onChange={address => this.setState({address})} />
        </div>
        <div style={{padding: 20}}>or</div>
        <div>
          <div>Browser geolocation</div>
          <button onClick={this.handleBrowserLocationClick}>
            {isRequestingLocation ? 'getting location…' : 'update my location'}
          </button>
        </div>
      </div>
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
