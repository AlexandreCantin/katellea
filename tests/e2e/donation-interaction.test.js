module.exports = {
  'Can comment current donation': function (client) {
    client
      .url('http://localhost:3000')
      .waitForElementPresent('body', 1000)
      .assert.visible('button#JohnDoe')
      .execute(client.resizeWindow(1200, 3000))
      .click('button#JohnDoe')
      .pause(1500)
      .assert.containsText('main h1', 'Proposition de don en cours')

      // Add comment
      .assert.value(".events .comment-input #comment", '')
      .assert.elementNotPresent(".events .event.donation-comment")
      .setValue('.events .comment-input #comment', "Hello world!")
      .click('.events .comment-input #submit-comment')
      .pause(1000)
      .assert.elementPresent(".events .event.donation-comment")
      .assert.containsText(".events .event.donation-comment", "Hello world!")

      // Test comment form is reset
      .assert.value(".events .comment-input #comment", '')
      .assert.attributeEquals(".events .comment-input #submit-comment", 'disabled', 'true')

      .end();
  },

  'Can update poll answer': function (client) {
    client
      .url('http://localhost:3000')
      .waitForElementPresent('body', 1000)
      .assert.visible('button#JohnDoe')
      .execute(client.resizeWindow(1200, 3000))
      .click('button#JohnDoe')
      .pause(1500)
      .assert.containsText('main h1', 'Proposition de don en cours')

      // Check current page
      .assert.elementPresent(".poll-answer.poll-on-going")
      .assert.elementPresent(".poll-table form.poll-form")
      .assert.containsText(".poll-answer.poll-on-going > div:nth-child(2)", 'Oui')
      .assert.containsText(".poll-answer.poll-on-going > div:nth-child(3)", 'Oui')
      .assert.containsText(".poll-answer.poll-on-going > div:nth-child(4)", 'Oui')

      // Update poll answer
      .click('.poll-table form.poll-form .poll-answer-choices #no-0')
      .click('.poll-table form.poll-form .poll-answer-choices #maybe-1')
      .click('.poll-table form.poll-form input[type=submit]')
      .waitForElementPresent(".alert.success", 2000)

      // Check new value
      .assert.elementPresent(".poll-table form.poll-form")
      .assert.containsText(".poll-answer.poll-on-going > div:nth-child(2)", 'Non')
      .assert.containsText(".poll-answer.poll-on-going > div:nth-child(3)", 'Peut-être')
      .assert.containsText(".poll-answer.poll-on-going > div:nth-child(4)", 'Oui')

      // Close poll
      .assert.containsText('.donation-actions .actions button', 'Terminer le sondage')
      .click('.donation-actions .actions button')
      .waitForElementPresent(".donation-definitive-date", 2000)
      .assert.containsText(".donation-definitive-date h2", 'Action à réaliser : Prise de rendez-vous')
      .assert.elementNotPresent(".poll-table form.poll-form")

      .end();
  }
}