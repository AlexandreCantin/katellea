module.exports = {

  'History test': function (client) {
    client
      .url('http://localhost:3000')
      .waitForElementPresent('body', 1000)
      .assert.visible('button#JohnDoe')
      .execute(client.resizeWindow(1200, 3000))
      .click('button#JohnDoe')
      .pause(1500)
      .assert.containsText('main h1', 'Proposition de don en cours')

      // Donation history
      .click('nav.menu a[href="/historique-des-dons"]')
      .pause(1000)
      .assert.containsText('main h1', 'Historique des dons')
      .assert.containsText('.donation .date', 'Don effectué le : Dim. 09/06/2019')

      .end();
  }
};
