const jwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const db = require('../settings/syncdb1')
const config = require('./../dbenv')


let options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwt
}

//
// module.exports = passport => {
//     passport.use(
//         new jwtStrategy(options, (payload, done) => {
//             try{
//                 console.log(payload)
//                 console.log('passport')
//                 db.query(`SELECT id, login FROM users WHERE id = "${payload.userId}"`, (error, rows) => {
//                     if(error){
//                         console.log(error)
//                     }else {
//                         const user = rows
//                         if(user) {
//                             done(null, user)
//                         }else {
//                             done(null, false)
//                         }
//                     }
//                 })
//             }catch(e) {
//                 console.log(e.message)
//             }
//         })
//     )
// }

// module.exports = passport => {
//     passport.use(
//         new jwtStrategy(options, (payload, done) => {
//             try{
//                 console.log(payload)
//                 console.log('passport')
//                 db.query(`SELECT id, login FROM userss WHERE id = "${payload.userId}"`, (error, rows) => {
//                     if(error){
//                         console.log(error)
//                     }else {
//                         const user = rows
//                         if(user) {
//                             done(null, user)
//                         }else {
//                             done(null, false)
//                         }
//                     }
//                 })
//             }catch(e) {
//                 console.log(e.message)
//             }
//         })
//     )
// }
