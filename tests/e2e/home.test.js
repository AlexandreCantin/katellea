module.exports = {
  'Home page test' : function (client) {
    client
      .url('http://localhost:3000')
      .waitForElementPresent('body', 1000)
      .assert.containsText('h1', 'Bienvenue')
      .end();
  }
};