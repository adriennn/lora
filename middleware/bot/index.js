const express = require('express')

/*
 * This middleware allows the Telegram bot to interact with the app
 */

module.exports = (req, res, next) => {

    console.log('hit bot controller: ', req.body)

    try  {

        // let bot = req.app.get('bot')

        // bot.use({
        //   type: 'incoming',
        //   name: 'hello-middleware',
        //   controller: (bot, update) => {
        //     return bot.reply(update, 'Hello!')
        //   }
        // })

        // botmaster middlewae goes here
        // console.log('bot instance: ', JSON.stringify(bot))

        return res.status(200).send('OK')
    }

    catch (err) {

      return res.status(500).send('Internal Server Error')
    }
}
