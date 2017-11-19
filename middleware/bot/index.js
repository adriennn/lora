const express = require('express')

/*
 * This middleware allows the Telegram bot to interact with the app
 */

module.exports = (req, res, next) => {

    console.log('hit bot controller: ', req.body)

    try  {

        let bot = req.app.get('bot')

            // botmaster middlewae goes here

            console.log('bot data:', bot)

            return next()
    }

    catch (err) {

      return next(err)
    }
}