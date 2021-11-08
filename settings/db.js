
const mysql = require('mysql2/promise');
const env = require('./../dbenv')

class DB {
    async create(sql,parameters=[]) {
        try{
            console.log(111)
            this.dbh = await mysql.createConnection({
                host: "govzalla.beget.tech",
                user: "govzalla_it_cnpp",
                password: "2404141rA!!",
                database: "govzalla_it_cnpp"
            });
            const [res] = await this.dbh.execute(sql, parameters)
            await this.dbh.end()
            console.log('connnect test')
            return res

        }catch (e) {
            console.log(e.message)
        }

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