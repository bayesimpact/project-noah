import React from 'react'
import ReactMapboxGl, {Layer, Marker, Feature} from 'react-mapbox-gl'
import {Link} from 'react-router'
import PlacesAutocomplete, {geocodeByAddress} from 'react-places-autocomplete'
import _ from 'underscore'
import {schemeCategory20} from 'd3-scale'

import config from 'config'
import {store} from 'store/firebase'


// Center of the US.
const START_LOCATION = [-96.328530, 38.321018]


class PublicView extends React.Component {
  static propTypes = {
    user: React.PropTypes.object,
  };

  componentWillMount() {
    store.getHazards(hazards => {
      const groupedHazards = _.groupBy(hazards, hazard => hazard.properties.prod_type)
      const sortedHazardNames = _.sortBy(Object.keys(groupedHazards), hazardName => {
        return -groupedHazards[hazardName].length
      })
      const hazardColorMapping = _.object(sortedHazardNames.map((name, i) => {
        return [name, i < 19 ? schemeCategory20[i] : schemeCategory20[19]]
      }))
      this.setState({groupedHazards, hazardColorMapping})
    })
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
    const {groupedHazards, hazardColorMapping, isAdmin} = this.state
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
          {_.map(groupedHazards, (hazards, name) => {
            return <Layer
                key={name}
                type="fill"
                paint={{'fill-color': hazardColorMapping[name], 'fill-opacity': .7}}>
              {(hazards || []).map((hazard, i) => {
                return <Feature key={i} coordinates={[hazard.geometry.coordinates]} />
              })}
            </Layer>
          })}
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
      <div style={style}>
        <div>Hola {user.displayName}</div>
        <UserPhoneNumber user={user} />
        {user.phoneNumber ? <UserLocationSelector address={user.address} /> : null}
      </div>
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
