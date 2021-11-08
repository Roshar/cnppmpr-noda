
const mysql = require('mysql2/promise');
const env = require('./../dbenv')
console.log(env)
class DB {
    async create(sql,parameters=[]) {
        try{
            this.dbh = await mysql.createConnection({
                host:env.HOST,
                //socketPath: env.SOCKET,
                //port: env.PORT,
                user: env.DB_USER,
                password: env.DB_PASSWORD,
                database: env.DB_NAME
            });
            const [res] = await this.dbh.execute(sql, parameters)
            await this.dbh.end()
            return res
        }catch (e) {
            console.log(e.message)
        }

    }
}

// async function db(sql, option = []) {
//
//     try{
//         // create the connection
//         const connection = await mysql.createConnection({
//             host:env.HOST,
//             socketPath: env.SOCKET,
//             port: env.PORT,
//             user: env.DB_USER,
//             password: env.DB_PASSWORD,
//             database: env.DB_NAME
//         });
//         // query database
//         const [res, fields] = await connection.execute(sql, option);
//         connection.end()
//         return res
//     }catch (e) {
//         console.log(e.message)
//     }
// }

 module.exports = DB