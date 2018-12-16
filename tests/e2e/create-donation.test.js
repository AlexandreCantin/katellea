module.exports = {
  'Can create new donation in an establishment': function (client) {
    client
      .url('http://localhost:3000')
      .waitForElementPresent('body', 1000)
      .assert.visible('button#DrManhattan')
      .execute(client.resizeWindow(1200, 3000))
      .click('button#DrManhattan')
      .pause(1500)
      .assert.containsText('main h1', 'Tableau de bord')

      // Show new donation modal and validation form
      .click('#donation .new-donation-container button')
      .waitForElementPresent('form#create-form-modal', 2000)
      .click('form#create-form-modal input[value="ESTABLISHMENT"]')
      .pause(500)
      .click('form#create-form-modal .submit-zone input[type=submit]')
      .pause(2000)

      // User should be on current donation page
      .assert.containsText('main h1', 'Proposition de don en cours');
  },


  'Can create new donation in a mobile collect': function (client) {
    client
      .url('http://localhost:3000')
      .waitForElementPresent('body', 1000)
      .assert.visible('button#JamesBond')
      .execute(client.resizeWindow(1200, 3000))
      .click('button#JamesBond')
      .pause(1500)
      .assert.containsText('main h1', 'Tableau de bord')

      // Show new donation modal and validation form
      .click('#donation .new-donation-container button')
      .waitForElementPresent('form#create-form-modal', 2000)
      .click('form#create-form-modal input[value="MOBILE_COLLECT"]')
      .setValue('form#create-form-modal textarea#free-location', 'Mon super don') // TODO: Improve with mobileCollect form
      .click('form#create-form-modal .submit-zone input[type=submit]')
      .pause(5000)

      // User should be on current donation page
      .assert.containsText('main h1', 'Proposition de don en cours')
  }
}