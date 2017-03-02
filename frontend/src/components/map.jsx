import React from 'react'
import ReactMapboxGl, {Layer, Feature} from 'react-mapbox-gl'
import _ from 'underscore'

import config from 'config'

class HazardMap extends React.Component {
  static propTypes = {
    children: React.PropTypes.node,
    groupedHazards: React.PropTypes.object,
    hazardColorMapping: React.PropTypes.object,
    onHazardClick: React.PropTypes.func,
    style: React.PropTypes.object,
  }

  render() {
    const {children, style, groupedHazards, hazardColorMapping, onHazardClick} = this.props
    return (
      <ReactMapboxGl
          accessToken={config.mapboxAccessToken}
          containerStyle={style}
          {...this.props}
          style="mapbox://styles/mapbox/streets-v8">
        {children}
        {_.map(groupedHazards || {}, (hazards, name) => {
          return <Layer
              key={name}
              type="fill"
              paint={{'fill-color': hazardColorMapping[name], 'fill-opacity': .7}}>
            {(hazards || []).map((hazard, i) => {
              return <Feature
                  key={i} coordinates={[hazard.geometry.coordinates]}
                  onClick={() => onHazardClick && onHazardClick(hazard.id)} />
            })}
          </Layer>
        })}
      </ReactMapboxGl>
    )
  }
}

export {HazardMap}
