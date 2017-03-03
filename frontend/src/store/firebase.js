import firebase from 'firebase'
import firebaseui from 'firebaseui'
import {browserHistory} from 'react-router'
import _ from 'underscore'
import {schemeCategory20} from 'd3-scale'

// Initialize Firebase
var firebaseConfig = {
  apiKey: 'AIzaSyAp61fFTRHuVwSTPqRlAGSvnQlz9pJhtxg',
  authDomain: 'project-noah-3a7f7.firebaseapp.com',
  databaseURL: 'https://project-noah-3a7f7.firebaseio.com',
  storageBucket: 'project-noah-3a7f7.appspot.com',
  messagingSenderId: '609290107025',
}
const configuredFirebase = firebase.initializeApp(firebaseConfig)
const db = configuredFirebase.database()
var configuredFirebaseUi = new firebaseui.auth.AuthUI(configuredFirebase.auth())

// TODO: Replace this ad-hoc solution by a Redux store.
const store = {
  getHazards: function(callback) {
    // Current hazards are extracted from an API which calls them _watches_.
    // Please see hazard_watches_api.ipynb for details.
    db.ref('/data/watches').on('value', snapshot => {
      const hazards = snapshot.val().map((hazard, i) => ({...hazard, id: i}))
      const groupedHazards = _.groupBy(hazards, hazard => hazard.properties.prod_type)
      const sortedHazardNames = _.sortBy(Object.keys(groupedHazards), hazardName => {
        return -groupedHazards[hazardName].length
      })
      const hazardColorMapping = _.object(sortedHazardNames.map((name, i) => {
        return [name, i < 19 ? schemeCategory20[i] : schemeCategory20[19]]
      }))
      callback({groupedHazards, hazards, hazardColorMapping, sortedHazardNames})
    })
  },
  getUserProfiles: function(callback) {
    db.ref('/userProfiles').on('value', snapshot => {
      callback(snapshot.val())
    })
  },
  getUserIsAdmin: function(user, callback) {
    db.ref(`/admins/${user.uid}`).on('value', snapshot => {
      callback(snapshot.val())
    })
  },
  loginChanged: function(callback) {
    configuredFirebase.auth().onAuthStateChanged(user => {
      this.user = {...user, isLoadingProfile: true}
      if (user) {
        db.ref(`/userProfiles/${user.uid}`).on('value', snapshot => {
          this.user = {...this.user, ...snapshot.val(), isLoadingProfile: false}
          callback(this.user)
        })
        db.ref(`/admins/${user.uid}`).on('value', snapshot => {
          this.isAdmin = snapshot.val()
        })
      }
      callback(this.user)
    })
  },
  logout: function() {
    configuredFirebase.auth().signOut()
  },
  startFirebaseUi: function(elmentId, config) {
    const uiConfig = {
      callbacks: {
        signInSuccess: () => {
          browserHistory.push(config.redirectUrl)
          return false
        },
      },
      'signInOptions': [
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
      ],
      credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    }
    configuredFirebaseUi.start('#firebaseui-auth-container', uiConfig)
  },
  updateUserProfile: function(profile) {
    if (!this.user) {
      throw 'No user logged in!'
    }
    db.ref(`/userProfiles/${this.user.uid}`).update(profile)
  },
  sendWarning: function(users, notificationText) {
    (users || []).forEach(user => {
      const notification = {
        number: user.phoneNumber,
        sent: false,
        text: notificationText,
      }
      db.ref('/notifications').push(notification)
    })
  },
}

export {
  store,
}
