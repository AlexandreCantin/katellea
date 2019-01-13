module.exports = {
  'Ask GRPD export test': function (client) {
    client
      .url('http://localhost:3000')
      .waitForElementPresent('body', 1000)
      .assert.visible('button#JamesBond')
      .execute(client.resizeWindow(1200, 3000))
      .click('#JamesBond')
      .pause(1000)

      // Account
      .moveToElement('nav.katellea .my-account.dropdown-container button', 10, 10)
      .pause(500)
      .click('nav.katellea a[href="/mon-profil"]')
      .pause(1500)
      .assert.containsText('main h1', 'Mon profil')

      // Ask GRPD export
      .assert.containsText('#grpd-export button.btn.big', 'Demander un export de vos données')
      .click('#grpd-export button.btn.big')
      .waitForElementPresent('.alert.success', 2000)

      // Cancel GRPD Export
      .assert.containsText('#grpd-export button.btn.big.danger', 'Annuler la demande d\'export de vos données')
      .click('#grpd-export button.btn.big')
      .pause(1000)
      .assert.containsText('#grpd-export button.btn.big', 'Demander un export de vos données')

      .end();
  },
};
