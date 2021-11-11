
const mysql = require('mysql2/promise');
const env = require('./../dbenv')

class DB {
    static connect() {
        return mysql.createConnection({

            //ВНЕШНЯ БАЗА НА БЕГЕТ
            host: "govzalla.beget.tech",
            user: "govzalla_it_gov",
            password: "2404141rA!",
            database: "govzalla_it_gov"
            //
            // host: "localhost",
            // user: "root",
            // password: "1234567890",
            // database: "srm"



                // //
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