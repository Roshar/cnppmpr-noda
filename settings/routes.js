'use strict'

module.exports = (app) => {
    const indexCtrl = require('./../Controller/IndexController')
    const usersCtrl = require('./../Controller/UsersController')
    app.route('/').get(indexCtrl.index)
    app.route('/users').get(usersCtrl.users)
}