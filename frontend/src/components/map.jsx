import React from 'react'
import ReactMapboxGl, {Layer, Feature} from 'react-mapbox-gl'
import _ from 'underscore'

import config from 'config'

class HazardMap extends React.Component {
  static propTypes = {
    style: React.PropTypes.object,
    groupedHazards: React.PropTypes.object,
    hazardColorMapping: React.PropTypes.object,
    zoom: React.PropTypes.array,
    center: React.PropTypes.array.isRequired,
    children: React.PropTypes.element,
  }

  render() {
    const {children, style, groupedHazards, hazardColorMapping, zoom, center} = this.props
    return (
      <ReactMapboxGl
          style="mapbox://styles/mapbox/streets-v8"
          accessToken={config.mapboxAccessToken}
          center={center} zoom={zoom}
          containerStyle={style}>
        {children}
        {_.map(groupedHazards || {}, (hazards, name) => {
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
    )
  }
}

export {HazardMap}
