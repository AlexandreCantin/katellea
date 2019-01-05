module.exports = {
  'Update account test': function (client) {
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
      .click('nav.katellea a[href="/mon-compte"]')
      .pause(1500)
      .assert.containsText('main h1', 'Votre compte')

      // Check values
      .assert.value('.form.update-account input#first-name', 'James')
      .assert.value('.form.update-account input#last-name', 'Bond')
      .assert.value('.form.update-account input#email', 'jamesBond@mail.com')
      .assert.value('.form.update-account select#donation-preference', 'NONE')
      .assert.value('.form.update-account select#blood-type', 'UNKNOWN')

      // Update form data
      .clearValue('.form.update-account input#first-name')
      .setValue('.form.update-account input#first-name', 'Roger')
      .clearValue('.form.update-account input#last-name')
      .setValue('.form.update-account input#last-name', 'Moore')
      .clearValue('.form.update-account input#email')
      .setValue('.form.update-account input#email', 'rogerMoore@mail.com')
      .setValue('.form.update-account select#donation-preference', 'PLASMA') // FIXME: not working...
      .setValue('.form.update-account select#blood-type', 'A+')
      .saveScreenshot('./reports/homepage.png')
      .click('.form.update-account input[type=submit]')
      .waitForElementPresent('.alert.success', 1000)
      .saveScreenshot('./reports/homepage2.png')

      // Reload home page
      .moveToElement('nav.katellea .my-account.dropdown-container button', 10, 10)
      .pause(500)
      .click('nav.katellea a[href="/mon-compte"]')
      .pause(1500)
      .assert.containsText('main h1', 'Votre compte')

      // Check values
      .assert.value('.form.update-account input#first-name', 'Roger')
      .assert.value('.form.update-account input#last-name', 'Moore')
      .assert.value('.form.update-account input#email', 'rogerMoore@mail.com')
      // .assert.value('.form.update-account select#donation-preference', 'PLASMA')
      .assert.value('.form.update-account select#blood-type', 'A+')

      .end();
  },
};
