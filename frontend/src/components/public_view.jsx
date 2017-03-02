import React from 'react'
import {Layer, Marker} from 'react-mapbox-gl'
import PlacesAutocomplete, {geocodeByAddress} from 'react-places-autocomplete'
import SearchIcon from 'react-icons/lib/md/search'
import LocationIcon from 'react-icons/lib/md/my-location'

import {HazardMap} from 'components/map'
import {store} from 'store/firebase'

// TODO: Move all colors into constants.

// Center of the US.
const START_LOCATION = [-96.328530, 38.321018]


class PublicView extends React.Component {
  static propTypes = {
    user: React.PropTypes.object,
  };

  componentWillMount() {
    store.getHazards(({groupedHazards, hazardColorMapping, sortedHazardNames}) => {
      this.setState({groupedHazards, hazardColorMapping, sortedHazardNames})
    })
  }

  state = {
    groupedHazards: null,
    hazardColorMapping: null,
    sortedHazardNames: null,
  }

  render() {
    const {user} = this.props
    const {groupedHazards, hazardColorMapping, sortedHazardNames} = this.state
    const locationSelectorStyle = {
      heigth: 55,
      left: 30,
      position: 'absolute',
      top: 30,
      width: 600,
      zIndex: 1,
    }
    const legendStyle = {
      bottom: 30,
      left: 30,
      maxHeight: '50%',
      position: 'absolute',
      width: 300,
      zIndex: 1,
    }
    const mapboxContainerStyle = {
      // 80px is the height of the global header.
      height: 'calc(100vh - 80px)',
      width: '100vw',
    }
    return (
      <div>
        {user && !user.isLoadingProfile && !user.termsAccepted ? <ProfileModal /> : null}
        <div style={{position: 'relative'}}>
          {user && user.termsAccepted ?
            <UserLocationSelector style={locationSelectorStyle} address={user.address} /> : null}
          {hazardColorMapping && sortedHazardNames ?
            <Legend
                style={legendStyle}
                colorMapping={hazardColorMapping} sortedNames={sortedHazardNames} /> : null}
          <HazardMap
              style={mapboxContainerStyle} user={user}
              center={user && user.location || START_LOCATION}
              zoom={user && user.location ? [7] : [4]}
              groupedHazards={groupedHazards} hazardColorMapping={hazardColorMapping}>
            <Layer type="symbol" id="marker" layout={{'icon-image': 'marker-15'}}>
              {user && user.location ? <Marker coordinates={user.location} /> : null}
            </Layer>
          </HazardMap>
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
      backgroundColor: '#fff',
      boxShadow: '0 0 5px 0 rgba(0, 0, 0, 0.25)',
      display: 'flex',
      ...style,
    }
    const iconBox = {
      alignItems: 'center',
      display: 'flex',
      fontSize: 20,
      justifyContent: 'center',
      width: 60,
    }
    const autocompleteStyles = {
      root: {
        flex: 1,
      },
      input: {
        border: 'none',
      },
    }
    const borderStyle = '1px solid #f1f1f1'
    return (
      <div style={containerStyle}>
        <div style={{...iconBox, borderRight: borderStyle}}><SearchIcon /></div>
        <PlacesAutocomplete
            value={address}
            styles={autocompleteStyles}
            placeholder="Enter your address"
            onSelect={this.handlePlacesSelect}
            onChange={address => this.setState({address})} />
        <div
            className={isRequestingLocation ? 'blink' : null}
            style={{...iconBox, cursor: 'pointer', borderLeft: borderStyle}}
            onClick={this.handleBrowserLocationClick}>
          <LocationIcon />
        </div>
      </div>
    )
  }
}


class Legend extends React.Component {
  static propTypes = {
    colorMapping: React.PropTypes.object.isRequired,
    sortedNames: React.PropTypes.array.isRequired,
    style: React.PropTypes.object.isRequired,
  }

  render() {
    const {colorMapping, sortedNames, style} = this.props
    const containerStyle = {
      boxShadow: '0 0 5px 0 rgba(0, 0, 0, 0.25)',
      color: '#212121',
      overflowY: 'scroll',
      ...style,
    }
    const listItemStyle = {
      backgroundColor: '#fff',
      borderBottom: '1px solid #f1f1f1',
      height: 55,
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 20,
    }
    const boxStyle = {
      width: 20,
      height: 20,
      marginRight: 20,
    }
    return (
      <div style={containerStyle}>
        {sortedNames.map(name => {
          return <div key={name} style={listItemStyle}>
            <div style={{...boxStyle, backgroundColor: colorMapping[name]}} />
            <div>{name}</div>
          </div>
        })}
      </div>
    )
  }
}


export {PublicView}
