/* eslint-disable no-console */

var config = require('./config')
var twilioClient = require('twilio')(config.accountSid, config.authToken)
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

db.ref('/notifications').orderByChild('sent').endAt(false).on('child_added', snapshot => {
  const notification = snapshot.val()
  console.log('> texting to', notification)
  twilioClient.messages.create({
    body: notification.text || 'The flood is coming. Ruuuuun! 🏃💨',
    to: notification.number,
    from: config.sendingNumber,
  }, err => {
    if (err) {
      console.error('Error sending the text')
      console.log('>>', err)
    } else {
      console.log(`Text sent to ${notification.number}`)
      db.ref(`/notifications/${snapshot.key}/sent`).set(true)
    }
  })
})

process.on('SIGINT', function() {
  process.exit()
})
