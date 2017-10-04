const path    = require('path')
const dbUtils = require(path.join(__dirname,'./db.js'))

module.exports = (req, res, next) => {

  console.log('hit showDb', res.locals)

  // Pass req to the next middleware if it's not for the db
  if (res.locals.resource !== 'db') return next()

  try {

    res.locals.records = dbUtils.getAll(res.locals.dev_eui)

  } catch (err) {

    return next(err)
  }

  return res.render('data', {
      resource : 'db'
    , title    : 'Current data in db for selected schema'
    , data     : res.locals.records
  })

}
