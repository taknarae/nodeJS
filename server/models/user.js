const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); //bcrypt API 연결
const saltRounds = 10;
const jwt = require('jsonwebtoken');


const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50
  },
  email: {
    type: String,
    trim: true, //띄어쓰기(빈칸)을 제거하는 역할
    unique: 1 //중복된 이메일 막아줌
  },
  password: {
    type: String,
    minlength: 5
  },
  role: { // 예) 넘버가 1이면 관리자고 넘버가 0이면 일반유저
    type: Number,
    default: 0
  },
  image: String,
  token: { // 토큰을 이용해 나중에 유효성 관리를 할 수 있음
    type: String
  },
  tokenExp: { //토큰을 사용할 수 있는 기간
    type: Number
  }
})

//mongoose의 pre()메서드를 활용 'save'메서드가 호출되기전에 콜백함수가 실행
userSchema.pre('save', function(next){ //next인자는 pre메서드가 실행되고 다시 save()메서드가 호출된 위치로 넘기기 위해 필요
  const user = this;

  //password가 변경될때만 비밀번호 암호화
  if(user.isModified('password')){
    bcrypt.genSalt(saltRounds, function(err, salt) {
      if(err) return next(err); //err 발생시 함수종료하고 next메서드로 err전달
      bcrypt.hash(user.password, salt, function(err, hash) {
        //salt 생성했으면 비밀번호 해싱
        //hash의 첫번째인자 = 사용자가 입력한 비밀번호
        //hash의 두번째인자 = 생성한 salt
        //hash의 세번째인자 = 콜백함수
        if(err) return next(err);
        user.password = hash;
        
        next(); //next() 안하면 save()메서드가 호출된 위치로 넘어가지 않음
      });
  });
  }else {
    next(); //비밀번호가 변경되지 않으면 암호화코드 실행하지 않고 next로 save가 호출된 위치로 나감
  }
});

userSchema.methods.comparePassword = function(plainPW){
  //사용자가 입력한 비밀번호와 DB에 암호화된 비밀번호가 같은지 확인 > 일치하면true, 불일치false
  return bcrypt.compare(plainPW, this.password); //(사용자가 입력한 비밀번호,DB에서 검색한 데이터 비밀번호)
};

//jsonwebtoken토큰생성(모델생성 전), generateToken//수정가능
userSchema.methods.generateToken = function(){
  const user = this; //userSchema
  const token = jwt.sign(user._id.toJSON(), 'secretToken'); //jwt생성(mongodb에_id값)
  this.token = token;
  return this.save();
}

//주어진 토큰을 검증하고 해당 토큰이 유효한 사용자인지 확인
userSchema.statics.findByToken = function(token, cb){ //cb=callback
  // token = client에서 받은 jwt토큰, cb는 콜백함수
  const user = this;

  //토큰 복호화(디코딩 = 암호화된 데이터를 원래의 형태로 되돌리는 과정)
  jwt.verify(token, 'secretToken', function(err,decoded){
    // token을 디코드해서 userId를 가지고 DB에서 유저를 찾음
    user.findOne({ '_id':decoded, 'token':token })

    .then((user) => {
      cb(null, user); //token이 일치하면 err=null과 user정보를 콜백함수로 전달
    })
    .catch((err) => { //일치하지 않으면 에러전달
      return cb(err);
    })

  })
}

//mongoose.model(모델의 이름, 스키마)
const User = mongoose.model('User', userSchema);

// 다른 곳에도 쓸수 있게 exports 해줌
module.exports = { User }


// ==========================================
// const mongoose = require('mongoose');
// const userSchema = mongoose.Schema({ //스키마는 정보들의 설정을 지정
//   name:{
//     type: String,
//     maxlength: 50,
//   },
//   email:{
//     type: String,
//     trim: true, //띄어쓰기 제거
//     unique: 1, //데이터베이스에 1개의 이메일 주소만 넣음
//   },
//   password:{
//     type: String,
//     minlength: 5,
//   },
//   role: { //0이면 관리자, 1이면 유저. 이런식으로 구분
//     type: Number,
//     default: 0,
//   },
//   images: String,
//   token: { //토근을 이용해 나중에 유효성관리 가능
//     type: String 
//   },
//   tokenExp: {
//     type: Number,
//   }
// });

// //mongoose.model(모델이름,스키마)
// const User = mongoose.model('User', userSchema);

// //다른곳에서도 사용가능하게 내보내기
// module.exports = {User};

