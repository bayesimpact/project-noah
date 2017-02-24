import arcgis
from arcgis.gis import GIS
import datetime
import json

def fetch_layer(url, filename=None):
    '''
    INPUTS: url, filename (optional)
    OUTPUT: json object

    Requests the information from the layer at the given url.
    Returns the results as a json object and writes to file if desired.
    '''
    gis = GIS()

    layer = arcgis.features.FeatureLayer(url, gis)
    events = [e.as_dict for e in layer.query().features]
    json_events = [json.dumps(e) for e in events]

    if filename is not None:
        with open('data/' + filename + '.json', 'w') as f:
            json.dump(json_events,f,sort_keys=True)

    return json_events


if __name__ == '__main__':
    URLS = [
	     'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Climate_Outlooks/cpc_weather_hazards/MapServer/4',

# NWS_Forecasts_Guidance_Warnings query does not return, we need to limit its scope to california.
#	     'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/watch_warn_adv/MapServer/1',
#            'https://wildfire.cr.usgs.gov/ArcGIS/rest/services/geomac_dyn/MapServer/0',
#            'https://wildfire.cr.usgs.gov/ArcGIS/rest/services/geomac_dyn/MapServer/1',
#            'https://wildfire.cr.usgs.gov/ArcGIS/rest/services/geomac_perims/MapServer/0',
#            'https://wildfire.cr.usgs.gov/ArcGIS/rest/services/geomac_fires/MapServer/1',
#            'https://wildfire.cr.usgs.gov/ArcGIS/rest/services/geomac_fires/MapServer/2',
#            'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Observations/ahps_riv_gauges/MapServer/2',
#            'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/sig_riv_fld_outlk/MapServer/0',
            ]

    NAMES = [
	     '3-7 Day Precipitation Outlook',
#	     'WatchesWarnings',
#            'Current Fires',
#            'Current Fire Perimeters',
#            'geomac_nifc_lrg_fires_dd83',
#            'Geomac - Large Fire Points',
#            'Geomac - Fire Perimeters',
#            '72 Hour Forecast River Stages',
#            'Flood Outlook'
            ]

    all_events = []

    for url, name in zip(URLS,NAMES):
        all_events.append(fetch_layer(url, name))
