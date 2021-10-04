function tbleCollection (obj) {
    const collection = {
        iom: obj + '_iom',
        student: obj+ '_student',
        report: obj + '_report',
        library: obj + '_library',
        subTypeTableIom: obj + '_sub_type_table_iom'
    }
    return collection
}
module.exports = {tbleCollection}