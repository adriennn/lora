module.exports = (req, res, next) => {

    console.log(req);

    let qr_url = req.params.url

    console.log('Received url', qr_url)

    // build api query and send it as promise and catch result to return it to user below

    // send the decoded url/code from the qrcode

    // get token
    const token = 'tada'

    res.render('button', {token: token})

}
