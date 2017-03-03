# Bayes Impact - Project Noah 

Prototype:

Live at [project-noah-3a7f7.firebaseapp.com](project-noah-3a7f7.firebaseapp.com)

To run on a local machine:

We packaged all components of our application into docker containers, it is easy to set up a local development environment after a dev installed docker on their local machine.

* Start the frontend development environment with hot reloading with one single command: `docker-compose up frontend`
* Start the backend (sending SMS through Twilio) with `docker-compose up backend`
  *This command expects some environment variables to be set. These variables are the API keys that we factored out in order to make all code easily sharable in an open repository.
* Import new data from the ArcGIS server into the database with `docker-compose run --rm data-preparation python watches_importer.py data/watches.json`
* To run the environment for data manipulation and preparation with Jupyter notebooks on `localhost:8889`: docker-compose up data-preparation


<!---
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
-->
# Introduction

Bayes Impact created Project Noah to be a simple, intuitive, real-time map that can notify users via text message if their proximity to an emergency or nonemergency hazard becomes a concern. The tool also allows city and state officials to view hazards on an interactive map and warn users who are too close to any particular hazard via text message.


## Product Design Research
###User Interviews 

We firmly believe in starting with the people we are building for first. So, we defined two users for emergency and non-emergency notifications: notification recipients - outdoor enthusiasts, tourists, locals - and notification administrators - city or state officials. 

We reached out to individuals who worked in emergency response and learned that few, if any, tools exists that allow officials to ping individuals who are nearing dangerous areas or situations.

We connected with avid outdoorsmen & women, and tourists who corroborated general concern around the inability for state and city officials to communicate dangerous scenarios. User interviews demonstrated that their current tools for finding information were complicated to use or served an alternate purpose.

These user interviews guided a broader research of similar products and how we can improve upon user needs and current product drawbacks. Read more about our research approach in the [Design Research guide.](https://github.com/bayesimpact/project-noah/wiki/Design-Research-and-Protoyping)

###Rapid Prototyping

We created two pipelines for product demonstration, design mockups that allowed for rapid feedback and several iterations. We developed three crude, clickable mockups using Balsamiq to determine basic functionality and user flow for a production MVP. 

Our production prototypes was delivered after Sprint 1 and Sprint 2, using the feedback and close collaboration with the design team. Our first production prototype was hacked together with a simple interface and hard coded dummy data to maximize product feedback for the final delivery of the product. 

View all of our product prototypes and individual user feedback that fed into each new iteration in the [Prototyping guide.](https://github.com/bayesimpact/project-noah/wiki/Design-Research-and-Protoyping)

##Technical Approach


##Project Team

Stephan Gabler, Technical Architect and primary project leader who was responsible for delivery of the final product.
Mehdi Jamei, Delivery Manager.
Brian Lewis, Interaction Designer / User Researcher / Usability Tester.
Guillaume Chaslot, Backend Web Developer.
Kirtan Upadhyaya, Product Manager.

##Agile Methodology
The Bayes Impact team implemented week long sprints following Scrum to rapidly iterate and test product mockups. We ran three, 1-week long sprints, starting with Sprint 0 (defined below). Stephan Gabler was the Scrum Master who managed daily standups, backlog grooming, and sprint planning sessions. For a full summary of the Bayes Agile methodology, refer to the [Project Management documentation.](https://github.com/bayesimpact/project-noah/wiki/Project-Management)

