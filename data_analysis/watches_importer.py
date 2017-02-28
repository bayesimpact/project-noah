"""Import data from a previously extracted file into our firebase database.

The imported data follows the geoJSON format.

Run the importer with the following command:

docker-compose run --rm data-preparation \
    python watches_importer.py data/watches.json
"""
import json
import os
import sys

import pyrebase
from shapely import geometry

# For an explanation see the hazard_watches_api notebook.
SIMPLIFICATION_TOLERANCE = 0.05

PROPERTIES_OF_INTEREST = frozenset([
    'expiration',
    'event',
    'issuance',
    'prod_type',
    'st_length(shape)',
])

PRIVATE_KEY_TEMPLATE = '-----BEGIN PRIVATE KEY-----\n%s\n-----END PRIVATE KEY-----\n'
SERVICE_ACCOUNT_CREDENTIALS = {
    'client_email': 'firebase-adminsdk-hmwrk@project-noah-3a7f7.iam.gserviceaccount.com',
    'client_id': '103732531459623575954',
    'private_key': PRIVATE_KEY_TEMPLATE % os.getenv('FIREBASE_ADMIN_PRIVATE_KEY'),
    'private_key_id': '469f5a4c2d0dd05750a483bd4ca044d0f86719d3',
    'projectId': 'project-noah-3a7f7',
    'type': 'service_account',
}
FIREBASE_CONFIG = {
    'apiKey': 'AIzaSyAp61fFTRHuVwSTPqRlAGSvnQlz9pJhtxg',
    'authDomain': 'project-noah-3a7f7',
    'databaseURL': 'https://project-noah-3a7f7.firebaseio.com',
    'serviceAccount': SERVICE_ACCOUNT_CREDENTIALS,
    'storageBucket': 'project-noah-3a7f7.appspot.com',
}


def _shaply_coords_to_list(shaply_coords):
    return list(zip(shaply_coords[0], shaply_coords[1]))


def prepare_geojson_from_watch(watch):
    """Simplify the high resolution polygon and convert it to geoJSON."""
    polygon_coords = watch['geometry']['rings'][0]
    polygon = geometry.Polygon(polygon_coords)
    simplified_polygon = polygon.simplify(SIMPLIFICATION_TOLERANCE)
    simplified_polygon_coords = _shaply_coords_to_list(simplified_polygon.exterior.coords.xy)

    properties = {k: v for k, v in watch['attributes'].items() if k in PROPERTIES_OF_INTEREST}
    properties['originalResolution'] = len(polygon_coords)
    properties['simplifiedResolution'] = len(simplified_polygon_coords)
    properties['center'] = _shaply_coords_to_list(polygon.centroid.xy)
    return {
        'type': 'Feature',
        'properties': properties,
        'geometry': {
            'type': 'Polygon',
            'coordinates': simplified_polygon_coords
        }
    }


# TODO: Add tests.
def main():
    """Main function to read in a file, convert the watches and add it to firebase."""
    if len(sys.argv) == 1:
        print('Please give a path to the file to be imported')
        sys.exit(1)

    firebase = pyrebase.initialize_app(FIREBASE_CONFIG)
    db = firebase.database()
    with open(sys.argv[1]) as watches_file:
        watches = json.load(watches_file)
    geo_json = [prepare_geojson_from_watch(watch) for watch in watches]
    db.child('data/watches').set(geo_json)


if __name__ == '__main__':
    main()
