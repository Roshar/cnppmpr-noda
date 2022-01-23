'use strict'
const response = require('./../response')
const userId = require('./../use/getUserId')

// /**
//  * Получить все ИОМЫ с кол-вом обучающихся
//  * ПРОФИЛЬ ТЬЮТОРА
//  */
// exports.getLearningIOM = async(req, res) => {
//     try {
//         const token = req.body.token
//         const uid = await userId(req.db,token)
//         const tutorId = uid[0]['user_id']
//
//         let iomSql = `SELECT DATE_FORMAT(created_at, '%d-%m-%Y') as created_at, iom_id,title,description FROM
//                       a_iom WHERE tutor_id = "${tutorId}"`
//         const [result] = await req.db.execute(iomSql)
//
//         let countMembers = [];
//         let countMembersSql = [];
//
//         if(result.length) {
//             for(let i = 0; i < result.length; i++){
//                 countMembersSql.push(`SELECT COUNT(*) as members FROM relationship_student_iom
//                                         WHERE iom_id = "${result[i]['iom_id']}"
//                                         AND tutor_id = "${tutorId}"`)
//                 countMembers.push((await req.db.execute(countMembersSql[i]))[0])
//                 result[i]['countMembers'] = countMembers[i][0]['members']
//             }
//         }
//
//         if(!result.length) {
//             response.status(201, [],res)
//         }else {
//             response.status(200,
//                 result,res)
//             return true
//         }
//     }catch (e) {
//         console.log(e.message)
//     }
// }







