const admin = require('firebase-admin')

const SAN_FRANSISCO = [-122.435885, 37.745192]
const PARIS = [2.358886, 48.862452]

admin.initializeApp({
  credential: admin.credential.cert({
    clientEmail: 'firebase-adminsdk-hmwrk@project-noah-3a7f7.iam.gserviceaccount.com',
    privateKey: '-----BEGIN PRIVATE KEY-----\n' +
      process.env.FIREBASE_ADMIN_PRIVATE_KEY + '\n' +
      '-----END PRIVATE KEY-----\n',
    projectId: 'project-noah-3a7f7',
  }),
  databaseURL: 'https://project-noah-3a7f7.firebaseio.com',
})
const db = admin.database()

// Add a few hazards around SF and Paris for testing.
const hazards = {}
for (var i = 0; i < 20; i++) {
  const city = i < 10 ? SAN_FRANSISCO : PARIS
  hazards[i] = [city[0] + Math.random() * 6 - 3, city[1] + Math.random() * 6 - 3]
}

db.ref('data/hazards').set(hazards)
