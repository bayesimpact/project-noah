import React from 'react'
import ReactMapboxGl, {Layer, Marker, Feature} from 'react-mapbox-gl'
import PlacesAutocomplete, {geocodeByAddress} from 'react-places-autocomplete'
import _ from 'underscore'
import {schemeCategory20} from 'd3-scale'
import SearchIcon from 'react-icons/lib/md/search'
import LocationIcon from 'react-icons/lib/md/my-location'

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
    const locationSelectorStyle = {
      heigth: 55,
      left: 30,
      position: 'absolute',
      top: 30,
      width: 600,
      zIndex: 1,
    }
    const mapboxContainerStyle = {
      height: '100vh',
      width: '100vw',
    }
    return (
      <div>
        {user && !user.isLoadingProfile && !user.termsAccepted ? <ProfileModal /> : null}
        <div style={{position: 'relative'}}>
          {user && user.termsAccepted ?
            <UserLocationSelector style={locationSelectorStyle} address={user.address} /> : null}
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


class UserLocationSelector extends React.Component {
  static propTypes = {
    address: React.PropTypes.string.isRequired,
    style: React.PropTypes.object,
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
    const {style} = this.props
    const containerStyle = {
      display: 'flex',
      backgroundColor: '#fff',
      boxShadow: '0 0 5px 0 rgba(0, 0, 0, 0.25)',
      ...style,
    }
    const iconBox = {
      fontSize: 20,
      width: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
    const autocompleteStyles = {
      root: {
        flex: 1,
      },
      input: {
        border: 'none',
      },
    }
    return (
      <div style={containerStyle}>
        <div style={{...iconBox, borderRight: '1px solid #f1f1f1'}}><SearchIcon /></div>
        <PlacesAutocomplete
            value={address}
            styles={autocompleteStyles}
            placeholder="Enter your address"
            onSelect={this.handlePlacesSelect}
            onChange={address => this.setState({address})} />
        <div
            className={isRequestingLocation ? 'blink' : null}
            style={{...iconBox, cursor: 'pointer', borderLeft: '1px solid #f1f1f1'}}
            onClick={this.handleBrowserLocationClick}>
          <LocationIcon />
        </div>
      </div>
    )
  }
}


export {PublicView}
