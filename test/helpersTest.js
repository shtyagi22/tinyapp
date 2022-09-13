const { assert } = require('chai');

const { getUserByEmail } = require('../express_server.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("user@example.com")
    const expectedUserID = "userRandomID";
    it("returns expectedUserID for user", () => {
      assert.strictEqual(user.id, 'userRandomID');
    });
    // Write your assert statement here
  });
});