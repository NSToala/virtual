const bcrypt = require('bcryptjs'),
    helpers = {}

helpers.encryptPassword = async (password) => {
    return await bcrypt.hashSync(password, bcrypt.genSaltSync(10))
    // return await bcrypt.hash(password, bcrypt.genSalt(10))
}

helpers.comparePassword = async (password, savedPassword) => {
    try {
        // return await bcrypt.compareSync(password, savedPassword)
        return await bcrypt.compare(password, savedPassword)    
    } catch (err) {
        console.error(err)
    }
}

module.exports = helpers