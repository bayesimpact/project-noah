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
            ]

    NAMES = [
	     '3-7 Day Precipitation Outlook',
            ]

    all_events = []

    for url, name in zip(URLS,NAMES):
        all_events.append(fetch_layer(url, name))
