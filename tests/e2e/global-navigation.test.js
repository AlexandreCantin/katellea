module.exports = {

  'Navigation test': function (client) {
    client
      .url('http://localhost:3000')
      .waitForElementPresent('body', 1000)
      .assert.visible('button#JohnDoe')
      .execute(client.resizeWindow(1200, 3000))
      .click('button#JohnDoe')
      .pause(1500)
      .assert.containsText('main h1', 'Proposition de don en cours')

      // Mentions légales
      .click('nav.menu a[href="/mentions-legales"]')
      .pause(1000)
      .assert.containsText('main h1', 'Mentions légales')

      // Our mission and our team
      .click('nav.menu a[href="/notre-mission-et-notre-equipe"]')
      .pause(1000)
      .assert.containsText('h1#mission', 'Notre mission')
      .assert.containsText('h1#equipe', 'Notre équipe')

      // Account
      .moveToElement('nav.katellea .my-account.dropdown-container button', 10, 10)
      .pause(500)
      .click('nav.katellea a[href="/mon-profil"]')
      .pause(1500)
      .assert.containsText('main h1', 'Mon profil')

      // Dashboard
      .click('nav.menu a[href="/tableau-de-bord"')
      .pause(1000)
      .assert.containsText('div#dashboard main h1', 'Tableau de bord')

      // Donation history
      .click('nav.menu a[href="/historique-des-dons"]')
      .pause(1000)
      .assert.containsText('main h1', 'Historique des dons')

      // Contact form
      .click('nav.menu a[href="/nous-contacter"]')
      .pause(1000)
      .assert.containsText('main h1', 'Nous contacter')

      // Logout
      .moveToElement('nav.katellea .my-account.dropdown-container button', 10, 10)
      .click('nav.katellea .logout')
      // .saveScreenshot('./tests/e2e/reports/dashboard.png')
      .assert.containsText('.presentation-container h1', 'Bienvenue')
      .pause(1000)

      .end();
  }
}