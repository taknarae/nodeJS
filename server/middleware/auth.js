//User.js를 불러오고 (http://localhost:5000/api/users/auth)
const { User } = require('../models/user');
let auth = (req, res, next) => { //인증처리하는 부분
  
  //client 쿠키에서 토큰을 가져옴
  let token = req.cookies.x_auth;
  // console.log(token)

  //유저가 있으면 인증okay, 없으면 인증no
  User.findByToken(token, (err,user) => { //user를 통해 findByToken이라는 메서드를 호출하여 복호화, 이때 인자로 client의 토큰전달
    console.log(err, user);
    if(err) throw err;

    //user가 없으면 isAuth:false로 error:true로 반환
    if(!user) return res.json({ isAuth:false, error:true });

    //user와 token정보를 req에 넣어줌
    req.token = token;
    req.user = user;
    next(); //next를 호출하여 auth미들웨어를 빠져나감
  }); 

}
module.exports = {auth}; //객체로 내보냄