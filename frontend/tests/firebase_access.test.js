const chai = require('chai')
const targaryen = require('targaryen/plugins/chai')
const expect = chai.expect
const DATABASE_RULES_PATH = 'database.rules.json'
const TEST_DATA_PATH = './firebase_access.testdata.json'
const rules = targaryen.json.loadSync(DATABASE_RULES_PATH)

chai.use(targaryen)

beforeEach(() => {
  targaryen.setFirebaseData(require(TEST_DATA_PATH))
  targaryen.setFirebaseRules(rules)
})

describe('data security rules', () => {
  test('data should be publicly accessible', () => {
    expect(targaryen.users.unauthenticated).can.read.path('/data')
  })

  test('data should not be writable, even when logged in', () => {
    // We only import this data through our service account who is still allowed to write.
    expect(targaryen.users.password).cannot.write('something').to.path('/data')
  })

  test('data should not be writable, even for admins', () => {
    // We only import this data through our service account who is still allowed to write.
    expect({uid: 'admin-user'}).cannot.write('something').to.path('/data')
  })
})

describe('notifications security rules', () => {
  test('admins should be allowed to write to notifications', () => {
    expect({uid: 'admin-user'}).can.write('something').to.path('/notifications')
  })

  test('normal users should not be allowed to write to notifications', () => {
    expect({uid: 'normal-user'}).cannot.write('something').to.path('/notifications')
  })

  test('not even admins should be allowed to read notifications', () => {
    // We only read this data through our service account who is still allowed to read.
    expect({uid: 'admin-user'}).cannot.read.path('/notifications')
  })
})

describe('userProfiles security rules', () => {
  test('unauthenticated users should not be able to read any profile', () => {
    expect(targaryen.users.unauthenticated).cannot.read.path('/userProfiles')
  })

  test('a user should be able to read from and to write to their own profile', () => {
    expect({uid: 'normal-user'}).can.write('something').to.path('/userProfiles/normal-user')
    expect({uid: 'normal-user'}).can.read.path('userProfiles/normal-user')
  })

  test("a user should not be able to read from and to write to someone else's profile", () => {
    expect({uid: 'normal-user'}).cannot.write('something').to.path('/userProfiles/other-user')
    expect({uid: 'normal-user'}).cannot.read.path('userProfiles/other-user')
  })

  test('an admin should be able to read from all user profiles', () => {
    expect({uid: 'admin-user'}).can.read.path('/userProfiles')
  })

  test('an admin should not be able to write to user profiles', () => {
    expect({uid: 'admin-user'}).cannot.write('something').to.path('/userProfiles')
  })
})

describe('admin security rules', () => {

  test('not even admins should be allowed to write to the admins collection', () => {
    // You have to use the web console to make someone an admin.
    expect({uid: 'admin-user'}).cannot.write('something').to.path('/admins')
  })

  test('admins should be allowed to read from their entry in the admins collection', () => {
    expect({uid: 'admin-user'}).can.read.path('/admins/admin-user')
  })

  test("admins should not be allowed to read from other's entry in the admins collection", () => {
    expect({uid: 'admin-user'}).cannot.read.path('/admins/other-user')
  })
})

