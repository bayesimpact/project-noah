# Bayes Impact - Project Noah 

Project Noah is an emergency warning application for city and state officials. It is live at [https://project-noah-3a7f7.firebaseapp.com/](https://project-noah-3a7f7.firebaseapp.com/)

![User View](https://cloud.githubusercontent.com/assets/7952712/23568687/83d33b9c-0010-11e7-9b77-4e6f66351202.png)

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

## The Project Team


* Stephan Gabler, Technical Architect and primary project leader who was responsible for delivery of the final product.
* Mehdi Jamei, Delivery Manager.
* Brian Lewis, Interaction Designer / User Researcher / Usability Tester.
* Guillaume Chaslot, Backend Web Developer.
* Kirtan Upadhyaya, Product Manager.
* Pascal Corpet, Backend Engineer.

## Our Agile Approach
The Bayes Impact team implemented week long sprints following Scrum to rapidly iterate and test product mockups. We ran three, 1-week long sprints, starting with Sprint 0 (defined below). Stephan Gabler was the Scrum Master who managed daily standups, backlog grooming, and sprint planning sessions. For a full summary of the Bayes Agile methodology, refer to the [Project Management documentation.](https://github.com/bayesimpact/project-noah/wiki/Project-Management)


## How We Designed Noah
### User Interviews 

We firmly believe in starting with the people we are building for first. So, we defined two users for emergency and non-emergency notifications: notification recipients - outdoor enthusiasts, tourists, locals - and notification administrators - city or state officials. 

We reached out to individuals who worked in emergency response and learned that few, if any, tools exists that allow officials to ping individuals who are nearing dangerous areas or situations. 

We connected with avid outdoorsmen & women, and tourists who corroborated general concern around the inability for state and city officials to communicate dangerous scenarios. User interviews demonstrated that their current tools for finding information were complicated to use or served an alternate purpose. 

These user interviews guided a broader research of similar products and how we can improve upon user needs and current product drawbacks. Read more about our research approach in the [Design Research guide.](https://github.com/bayesimpact/project-noah/wiki/Design-Research-and-Protoyping) 

### How We Rapidly Prototype

We created two pipelines for product demonstration, design mockups that allowed for rapid feedback and several iterations. We developed three crude, clickable mockups using Balsamiq to determine basic functionality and user flow for a production MVP. 

Our production prototypes was delivered after Sprint 1 and Sprint 2, using the feedback and close collaboration with the design team. Our first production prototype was hacked together with a simple interface and hard coded dummy data to maximize product feedback for the final delivery of the product. 

View all of our product prototypes and individual user feedback that fed into each new iteration in the [Prototyping guide.](https://github.com/bayesimpact/project-noah/wiki/Design-Research-and-Protoyping)

## Our Technical Approach

### Application architecture

The application used the React framework to build an easily maintainable and interactive single page application. We decided to use Google’s Firebase PaaS to get simple hosting, authentication and authentication out of the box. After the static files of the application are built in a Docker container by our CI system, they are deployed to Firebase hosting to be accessible by the client. The client furthermore uses Mapbox for an interactive map and Google places API for lockup of geographic coordinates. Firebase has the advantage of automated realtime syncing of data, which allows us to show new users and hazards in the admin view as soon as they are added to the database. The second part of the application is a node.js application running in a Docker container in Amazons’s Elastic Container Service. Also here the real-time nature of Firebase is advantageous because it allowed us to easily implement a message queue for SMS notifications. As soon as the client creates a new entry in the notifications collection on Firebase, the backend is notified of this new entry and sends a notification through the Twilio API. For detailed documentation and a list of our full technology stack, refer to our [Technical Approach.](https://github.com/bayesimpact/project-noah/wiki/Technical-Approach)

### Data

We investigated several of the APIs that were mentioned in the solicitation. We found one endpoint that contained warnings of different kind of hazards and we decided to use this single endpoint for our prototype. Details can be found in these [links.](https://github.com/bayesimpact/project-noah/tree/master/data_analysis/notebooks) Because the API endpoint fails with a HTTP 500 regularly, we did not set up a scheduled importer task yet. We are in communication with the providers of the API and will deploy a task to pull in fresh data at regular intervals as soon as the problems on their side are fixed.

To import the data we use a Python script that pulls the data from an ArcGIS server, simplifies the shapes of the hazard polygons in order to save bandwidth and space in our database and import them into our Firebase database.

### Continuous Integration Flow

Our continuous delivery process is built around Github and CircleCI. As soon as a new Pull Request gets created on Github, a new testing and build process is triggered on CircleCI. Additionally the reviewer assigned to the PR is notified via Reviewable.io. We decided to use Reviewable instead of GitHub because it gives us more control over the acceptance criteria of a pull request. When the build process was successful and the PR was accepted by at least one reviewer, the feature branch can be merged into master. The merge into master will trigger the deployment pipeline, which first will build again the containers, then run the linters and the tests again to check that nothing went wrong during the merge. If that was successful, the container of the backend is pushed to the Docker Hub registry and Amazon’s container service ECS will get notified that a new version of the backend is ready for deployment. ECS will automatically start running this new task in our AWS cluster. In a second step the static files for the client application are built in a Docker container and directly pushed to Firebase hosting. The third step is to deploy the Firebase database rules to the Firebase real-time database to make sure that data is only accessible to authorized users. We wrote extensive tests to guarantee the correctness of our database access rules. For detailed documentation, refer to our [Technical Approach.](https://github.com/bayesimpact/project-noah/wiki/Technical-Approach)

# Conclusion

Our holistic approach ensures that each requirement of the RFI was adequately addressed.

| Technical Requirements                                                                                                                                                                     | Successful Completion of RFI Requirements                                                                                                                                                                                                   |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 2a. Assigned one (1) leader and gave that person authority and responsibility and held that person accountable for the quality of the prototype submitted;                                    | Yes. Stephan Garbler who was the Technical Architect was the primary person of authority. More info on the management approach can be found [here.](https://github.com/bayesimpact/project-noah/wiki/Project-Management)                                                                                                                                           |
| 2b. Assembled a multidisciplinary and collaborative team that includes, at a minimum, five (5) of the labor categories as identified in Attachment B: PQVP DS-AD Labor Category Descriptions; | Our team consists of 5 labor categories. More info on our team can be found on our [here.](https://github.com/bayesimpact/project-noah/wiki/Project-Management)                                                                                                                                                                                                   |
| 2c. Understood what people needed, by including people in the prototype development and design process;                                                                                       | Our iterative prototyping with constant user feedback created 4 versions of our development application. More info on our iterative prototyping can be found [here.](https://github.com/bayesimpact/project-noah/wiki/Project-Management)                                                                                                                   |
| 2d. Used at least a minimum of three (3) “user-centric design” techniques and/or tools;                                                                                                       | The design method utilized by Bayes Impact involved 1) putting users first in the development process 2) iteratively designing the application according to user feedback 3) developing product specification according to user interviews. Further info on our user-centric design approach can be found [here.](https://github.com/bayesimpact/project-noah/wiki/Design-Research-and-Protoyping) |
| 2e. Used GitHub to document code commits;                                                                                                                                                     | Github is our primary source of all code commits, ensuring a common codebase.                                                                                                                                                               |
| 2f. Used Swagger to document the RESTful API, and provided a link to the Swagger API;                                                                                                         | Yes. Our full technical approach can be found [here.](https://github.com/bayesimpact/project-noah/wiki/Technical-Approach)                                                                                                                                                                                         |
| 2g. Complied with Section 508 of the Americans with Disabilities Act and WCAG 2.0;                                                                                                            | Bayes Impact fulfilled the requirements to the best of our capabilities.                                                                                                                                                                    |
| 2h. Created or used a design style guide and/or a pattern library;                                                                                                                            | Bayes Impact utilized the U.S. Web Design Standards for the design of the product, following the U.S. Digital Services Playbook.                                                                                                            |
| 2i. Performed usability tests with people;                                                                                                                                                    | Each design and product development version was defined by the user feedback of avid outdoor enthusiasts and one emergency responder.                                                                                                       |
| 2j. Used an iterative approach, where feedback informed subsequent work or versions of the prototype;                                                                                         | Our iterative approach is the hallmark of our development process. User feedback is at the center of our development. Refer to our [rapid prototyping ](https://github.com/bayesimpact/project-noah/wiki/Design-Research-and-Protoyping) for more info.                                                                                                                      |
| 2k. Created a prototype that works on multiple devices, and presents a responsive design;                                                                                                     | Our device has been optimized to perform on all computers, notepads, and mobile.                                                                                                                                                            |
| 2l. Used at least five (5) modern and open-source technologies, regardless of architectural layer (frontend, backend, etc.);|Our prototype used more than five modern and open source technologies. Technologies include Docker, Python, React, Webpack, Eslint, Jest, Targaryan, Firebase, CircleCI, AWS ECS, and Twilio. For a full list of our technology stack, refer to our [Technical Approach.](https://github.com/bayesimpact/project-noah/wiki/Technical-Approach)                                                                                                                                                                                                                                                                                                        
| 2m. Deployed the prototype on an Infrastructure as a Service (IaaS) or Platform as Service (PaaS) provider, and indicated which provider they used;| We deployed our prototype on Google Firebase (PaaS) and Amazon Web Services (ECS) to host our Docker container. For detailed documentation, refer to our [Technical Approach.](https://github.com/bayesimpact/project-noah/wiki/Technical-Approach)                                                                                                                                                                                                                                                                        
| 2n. Developed automated unit tests for their code;| We developed automated unit tests in our code.For detailed documentation, refer to our [Technical Approach.](https://github.com/bayesimpact/project-noah/wiki/Technical-Approach)                                                                                                                                                                                                                                                                                                            
| 2o. Setup or used a continuous integration system to automate the running of tests and continuously deployed their code to their IaaS or PaaS provider;                                       | We used CircleCI to run more tests and linters and continuously deploy code to Firebase and AWS. For detailed documentation, refer to our [Technical Approach.](https://github.com/bayesimpact/project-noah/wiki/Technical-Approach)                                                                                                                                                                                                                                                                                                      |
| 2p. Setup or used configuration management;                                                                                                                                                   | We setup configuration management using configuration files in a separate folder for front-end and backend. For detailed documentation, refer to our [Technical Approach](https://github.com/bayesimpact/project-noah/wiki/Technical-Approach) for set up.                                                                                                                                                                                                                                           |
| 2q. Setup or used continuous monitoring;                                                                                                                                                      | We have setup continuous monitoring through Amazon Web Services ECS and CloudWatch. For detailed documentation, refer to our [Technical Approach.](https://github.com/bayesimpact/project-noah/wiki/Technical-Approach)                                                                                                                                                                                                                                            |
| 2r. Deployed their software in an open source container, such as Docker (i.e., utilized operating-system-level virtualization);                                                               |  We deployed our software using Docker. For detailed documentation, refer to our [Technical Approach.](https://github.com/bayesimpact/project-noah/wiki/Technical-Approach)                                                                                                                                                                                                                                          |
| 2s. Provided sufficient documentation to install and run their prototype on another machine;                                                                                              | We provided significant documentation in the [Technical Approach](https://github.com/bayesimpact/project-noah/wiki/Technical-Approach) section that includes information about how to install and run our prototype on another machine.                                                                                                                                                                                                                                             |
| 2t. Prototype and underlying platforms used to create and run the prototype are openly licensed and free of charge.                                                                           |   Our prototype is completely open source and openly licensed free of charge as are the underlying platforms used to create and run it. 

