
module.exports = {
  'Dashboard page test' : function (client) {
    client
      .url('http://localhost:3000/')
      .waitForElementPresent('body', 2000)
      // Go to dashboard
      .url('http://localhost:3000/tableau-de-bord')
      .pause(1500)
      // Are we on the home page ?
      .assert.containsText('h1', 'Bienvenue')
      .end();
  },

  'Admin forbidden test' : function (client) {
      client
      .url('http://localhost:3000/')
      .waitForElementPresent('body', 2000)
      // Go to admin page
      .url('http://localhost:3000/admin')
      .pause(1500)
      // Are we on the not-found page ?
      .assert.containsText('p', 'Oups ! Nous n\'avons pas trouvé votre page...')
      .end();
  }
};
