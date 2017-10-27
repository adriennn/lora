const path    = require('path')
const dbUtils = require(path.join(__dirname,'./dbutils.js'))

module.exports = (req, res, next) => {

  console.log('hit showDb', res.locals)

  // Pass req to the next middleware if it's not for the db
  if (res.locals.resource !== 'db') return next()

  try {

    // TODO finish this
    res.locals.records = dbUtils.getHumanPayloads(res.locals.dev_eui, 10)

  } catch (err) {

    return next(err)
  }

  return res.render('data', {
      resource : 'db'
    , title    : 'Current data in db for selected schema'
    , data     : res.locals.records
  })

}
