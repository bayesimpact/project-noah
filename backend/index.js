const admin = require('firebase-admin')

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

db.ref('data/hazards').set({
  1: [-0.48, 51.32],
  2: [-0.49, 51.45],
})
