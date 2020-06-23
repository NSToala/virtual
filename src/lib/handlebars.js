const { format } = require('timeago.js'),
    helpers = {}

helpers.timeago = (timestamp)  => {
    return format(timestamp)
}

module.exports = helpers