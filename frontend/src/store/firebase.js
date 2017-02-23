import firebase from 'firebase'
import firebaseui from 'firebaseui'
import {browserHistory} from 'react-router'

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

const store = {
  getHazards: function(callback) {
    db.ref('/data/hazards').on('value', snapshot => {
      callback(snapshot.val())
    })
  },
  getUserProfiles: function(callback) {
    db.ref('/userProfiles').on('value', snapshot => {
      callback(Object.values(snapshot.val()))
    })
  },
  loginChanged: function(callback) {
    configuredFirebase.auth().onAuthStateChanged(user => {
      this.user = user
      if (user) {
        db.ref(`/userProfiles/${user.uid}`).on('value', snapshot => {
          this.user = {...this.user, ...snapshot.val()}
          callback(this.user)
        })
      }
      callback(user)
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
}

export {
  store,
}
