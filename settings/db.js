
const mysql = require('mysql2/promise');
const env = require('./../dbenv')

class DB {
    static connect() {
        return mysql.createConnection({
            host: "govzalla.beget.tech",
            user: "govzalla_it_cnpp",
            password: "2404141rA!!",
            database: "govzalla_it_cnpp"

                // host:env.HOST,
                // socketPath: env.SOCKET,
                // port: env.PORT,
                // user: env.DB_USER,
                // password: env.DB_PASSWORD,
                // database: env.DB_NAME

        });
    }

    async create(dbh, sql,parameters=[]) {
        return dbh.execute(sql, parameters)
    }
}

// class DB {
//     async create(sql,parameters=[]) {
//         try{
//
//             this.dbh = await mysql.createConnection({
//                 host:env.HOST,
//                 socketPath: env.SOCKET,
//                 port: env.PORT,
//                 user: env.DB_USER,
//                 password: env.DB_PASSWORD,
//                 database: env.DB_NAME
//             });
//             const [res] = await this.dbh.execute(sql, parameters)
//             await this.dbh.end()
//             return res
//         }catch (e) {
//             console.log(e.message)
//         }
//
//     }
// }


 module.exports = DB