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

# For an explanation the hazard_watches_api notebook.
SIMPLIFICATION_TOLERANCE = 0.05

properties_of_interest = [
    'expiration',
    'event',
    'issuance',
    'prod_type',
    'st_length(shape)',
]

private_key_template = '-----BEGIN PRIVATE KEY-----\n%s\n-----END PRIVATE KEY-----\n'
service_account_credentials = {
    'client_email': 'firebase-adminsdk-hmwrk@project-noah-3a7f7.iam.gserviceaccount.com',
    'client_id': '103732531459623575954',
    'private_key': private_key_template % os.getenv('FIREBASE_ADMIN_PRIVATE_KEY'),
    'private_key_id': '469f5a4c2d0dd05750a483bd4ca044d0f86719d3',
    'projectId': 'project-noah-3a7f7',
    'type': 'service_account',
}
firebase_config = {
    'apiKey': 'AIzaSyAp61fFTRHuVwSTPqRlAGSvnQlz9pJhtxg',
    'authDomain': 'project-noah-3a7f7',
    'databaseURL': 'https://project-noah-3a7f7.firebaseio.com',
    'serviceAccount': service_account_credentials,
    'storageBucket': 'project-noah-3a7f7.appspot.com',
}
firebase = pyrebase.initialize_app(firebase_config)
db = firebase.database()

if len(sys.argv) == 1:
    print('Please give a path to the file to be importet')
    sys.exit(1)

with open(sys.argv[1]) as watches_file:
    watches = json.load(watches_file)


def _shaply_coords_to_list(shaply_coords):
    return list(zip(shaply_coords[0], shaply_coords[1]))

geo_json = []
for watch in watches:
    polygon_coords = watch['geometry']['rings'][0]
    polygon = geometry.Polygon(polygon_coords)
    simplified_polygon = polygon.simplify(SIMPLIFICATION_TOLERANCE)
    simplified_polygon_coords = _shaply_coords_to_list(simplified_polygon.exterior.coords.xy)

    properties = {k: v for k, v in watch['attributes'].items() if k in properties_of_interest}
    properties['original_resolution'] = len(polygon_coords)
    properties['simplified_resolution'] = len(simplified_polygon_coords)
    properties['center'] = _shaply_coords_to_list(simplified_polygon.centroid.xy)
    feature = {
        'type': 'Feature',
        'properties': properties,
        'geometry': {
            'type': 'Polygon',
            'coordinates': simplified_polygon_coords
        }
    }
    geo_json.append(feature)
db.child('data/watches').set(geo_json)
