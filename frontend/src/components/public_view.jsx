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
  }

  state = {
    groupedHazards: null,
    hazardColorMapping: null,
  }

  render() {
    const {user} = this.props
    const {groupedHazards, hazardColorMapping} = this.state
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
        {user && !user.isLoadingProfile && !user.termsAccepted ? <ProfileModal /> : null}
        {user && user.termsAccepted ? <UserComponent user={user} /> : null}
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


class ProfileModal extends React.Component {

  state = {
    notificationsActive: true,
    phoneNumber: '',
    termsAccepted: false,
  }

  handleSubmit = () => {
    const {notificationsActive, phoneNumber, termsAccepted} = this.state
    store.updateUserProfile({notificationsActive, phoneNumber, termsAccepted})
  }

  render() {
    const {notificationsActive, phoneNumber, termsAccepted} = this.state
    const profileModalStyle = {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1,
    }
    const contentContainerStyle = {
      width: 500,
      backgroundColor: '#fff',
      padding: '0 50px 50px 50px',
    }
    // TODO: Add validation of the phone number.
    return (
      <div style={profileModalStyle}>
        <div style={contentContainerStyle}>
          <h2 style={{textAlign: 'center'}}>Profile</h2>
          <p>
            Please add your phone number below.
            After setting your location on the main page, we are going to alert you
            via SMS when there is a hazard warning close to you.
          </p>

          <label htmlFor="phone-number">Phone Number</label>
          <input
            id="phone-number" name="phone-number" type="text" value={phoneNumber}
            onChange={event => this.setState({phoneNumber: event.target.value})} />

          <input
              id="terms-accepted" type="checkbox" checked={termsAccepted}
              onChange={() => this.setState({termsAccepted: !termsAccepted})} />
          <label htmlFor="terms-accepted">I accept that my location is going to be stored.</label>

          <input
              id="notifications-active" type="checkbox" checked={notificationsActive}
              onChange={() => this.setState({notificationsActive: !notificationsActive})} />
          <label htmlFor="notifications-active">I want to receive hazard notifications</label>

          <button
              style={{marginTop: 20}}
              className={termsAccepted ? '' : 'usa-button-disabled'}
              onClick={this.handleSubmit}
              disabled={!termsAccepted}>Submit</button>
        </div>
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
        <UserLocationSelector address={user.address} />
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


export {PublicView}
