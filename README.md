# Bayes Impact - Project Noah 

Prototype:

Live at [project-noah-3a7f7.firebaseapp.com](project-noah-3a7f7.firebaseapp.com)


Warn people when the flood is about to come.

## Development

### Frontend

To run the frontend in development mode on `localhost:3005`:

```sh
  docker-compose up -d frontend
```


### Backend

To run the notification handler which will send our SMS through Twilio, you first have to set the `FIREBASE_ADMIN_PRIVATE_KEY` environment variable. Ask Stephan to get the right value for it. Then simply run:

```sh
  docker-compose run --rm backend node notification_handler.js
```

### Data Analysis
To run the enviroment for data manipulation and preparation with Jupyter notebooks on `localhost:8889`:

```sh
  docker-compose up data-preparation
```

This installs [ArcGIS API for Python](https://developers.arcgis.com/python/). If you need any other dependencies, add them to `requirements.txt` file and rebuild the docker image:

```sh
  docker-compose build data-preparation
```


## Frontend Deployment

Automated deployment is set up on CircleCI. If _master_ passes all tests, it will automatically be deployed to firebase hosting. If you want to deploy from local, you will first have to set the `$FIREBASE_TOKEN` environment env. Locally run `firebase login:ci` to obtain this token.

After setting the variable on your local machine you can deploy by running:

```sh
docker-compose run --rm frontend npm run deploy
```
