module.exports = {
  'First visit test': function (client) {
    client
      .url('http://localhost:3000')
      .waitForElementPresent('body', 1000)
      .assert.visible('button#JackSparrow')
      .execute(client.resizeWindow(1200, 3000))
      .click('#JackSparrow')
      .pause(1000)

      // First visit modal
      .assert.visible('#modal .modal-body.first-visit-form')
      .assert.containsText('#modal .modal-title h1', 'Bienvenue sur Katellea !')
      .assert.title('Votre tableau de bord | Katellea')
      .click('#modal .modal-body.first-visit-form .button-container')
      .pause(1000)

      // Etablishment
      .assert.containsText('#modal .modal-title h1', 'Etablissement de rattachement')
      .setValue("#location-select-form.establishment form input[type=text]", '44000')
      .click('#location-select-form.establishment form .btn')
      .pause(1000)
      .click('#location-select-form.establishment .suggestion:first-child .btn')
      .pause(1000)

      // Last donation
      .assert.containsText('#modal .modal-title h1', 'Votre dernier don')
      .click('input[name=noLastDonation]')
      .click('#modal .modal-body.first-visit-form.step-2 .button-container .next')
      .pause(1000)

      // Blood type
      .assert.containsText('#modal .modal-title h1', 'Votre groupe sanguin')
      .click('#modal .modal-body.first-visit-form .blood-type-choices input:first-child')
      .click('#modal .modal-body.first-visit-form.step-3 .button-container .next')
      .pause(1000)

      // Thank you
      .assert.containsText('#modal .modal-title h1', 'Merci !')
      .click('#modal .modal-body.first-visit-form .button-container .btn.big')
      .pause(1000)

      // Dashboard
      .assert.containsText('div#dashboard main h1', 'Tableau de bord')
      .assert.containsText('div#dashboard .main-content > .alert.success', 'Votre compte a été créé avec succès. Bienvenue sur Katellea !')

      .end();
  },
};