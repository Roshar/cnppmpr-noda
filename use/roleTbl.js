function roleTbl (role) {
  let tbl;
  if(role === 'admin') {
      tbl = 'admins'
  }else if (role === 'student') {
      tbl = 'students'
  }else {
      tbl = 'tutors'
  }
  return tbl
}
module.exports = roleTbl