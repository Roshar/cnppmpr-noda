function checkTerm(val)  {
    return  (Date.parse(new Date(val)) === Date.parse(new Date('01.01.1000'))) ? 'бессрочно' : val
}

module.exports = checkTerm