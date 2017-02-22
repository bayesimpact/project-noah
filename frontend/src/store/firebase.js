const firebase = require('firebase')

// Initialize Firebase
var firebaseConfig = {
  apiKey: 'AIzaSyAp61fFTRHuVwSTPqRlAGSvnQlz9pJhtxg',
  authDomain: 'project-noah-3a7f7.firebaseapp.com',
  databaseURL: 'https://project-noah-3a7f7.firebaseio.com',
  storageBucket: 'project-noah-3a7f7.appspot.com',
  messagingSenderId: '609290107025',
}
const configuredFirebase = firebase.initializeApp(firebaseConfig)

export default configuredFirebase
