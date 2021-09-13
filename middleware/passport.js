const jwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const db = require('./../settings/syncdb')
const config = require('./../dbenv')


var options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwt
}


module.exports = passport => {
    passport.use(
        new jwtStrategy(options, (payload, done) => {
            try{
                db.query(`SELECT id, login FROM users WHERE id = "${payload.userId}"`, (error, rows) => {
                    if(error){
                        console.log(error)
                    }else {
                        const user = rows
                        if(user) {
                            done(null, user)
                        }else {
                            done(null, false)
                        }
                    }
                })
            }catch(e) {
                console.log(e.message)
            }
        })
    )
}
