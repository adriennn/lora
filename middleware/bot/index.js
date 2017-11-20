const express = require('express')

/*
 * This middleware allows the Telegram bot to interact with the app
 */

 incomingMiddleware = (bot, update) => {
   if (update.message.text === 'hi' ||
       update.message.text === 'Hi' ||
       update.message.text === 'hello' ||
       update.message.text === 'Hello') {
     return bot.reply(update, 'well hi right back at you')

   } else if (update.message.text.indexOf('weather') > -1) {

     return bot.sendTextMessageTo('It is currently sunny in Philadelphia', update.sender.id)

   } else {

     const messages = ['I\'m sorry about this.',
                       'But it seems like I couldn\'t understand your message.',
                       'Could you try reformulating it?']
     return bot.sendTextCascadeTo(messages, update.sender.id)
   }
 }

module.exports = (req, res, next) => {

    console.log('hit bot controller: ', req.body)

    try  {

        let tgBot = req.app.get('bot')

        tgBot.use({
          type: 'incoming',
          name: 'incoming-middleware',
          controller: incomingMiddleware
        })

        return res.status(200).send('OK')
    }

    catch (err) {

      return res.status(500).send('Internal Server Error')
    }
}
