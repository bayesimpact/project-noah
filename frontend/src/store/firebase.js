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
var configuredFirebaseUi = new firebaseui.auth.AuthUI(configuredFirebase.auth())

const store = {
  getHazards: function(callback) {
    configuredFirebase.database().ref('/data/hazards').on('value', snapshot => {
      callback(snapshot.val())
    })
  },
  loginChanged: function(callback) {
    configuredFirebase.auth().onAuthStateChanged(user => {
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
}

export {
  store,
}
