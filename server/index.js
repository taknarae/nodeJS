const express = require("express")
const app = express();
const port = 5000;
const cors = require("cors")
const { User } = require("./models/user");//만들어 놨던 유저모델 객체를 가져옴
const config = require('./config/dev');
const { auth } = require('./middleware/auth');


const cookieParser = require('cookie-parser'); //생성된 토큰을 쿠키로 저장해주는 라이브러리

app.use(cors())
app.use(express.json()) //body-parser가 express에 내장되어있으므로 바로 사용 가능
app.use(cookieParser()) //cookie-parser사용

//mongoose를 이용해서 앱과 mongoDB를 연결
const mongoose = require('mongoose')
mongoose.connect(config.mongoURI)
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log(err))

app.get("/", async (req, res) => {
  res.send("Hello World")
})

//회원가입 할때 필요한 정보들을 client에서 가져오고 데이터베이스에 넣어준다.
app.post('/api/users/register', async (req, res) => { //(http://localhost:5000/api/users/register)
  //user 인스턴스 생성, req.body를 User인스턴스의 인자로 전달
  const user = new User(req.body);

  //save() = mongoDB에서 오는 메서드(정보들을 user모델에 저장)
  await user.save().then(() => {
    res.status(200).json({ //status(200) = 서버연결이 성공했다는 표시
      success: true
    }) //연결이 성공했으면 json형태로 success:true로 전달해 줍니다.
  }).catch((err) => {//데이터를 저장할때 에러가 발생할 경우
    res.json({success: false, err})//json형태로 success:false와 에러메시지를 전달
  })
})

app.post('/api/users/login', (req,res) => { //(http://localhost:5000/api/users/login)
  //입력한 이메일과 같은 값의 이메일이 DB에 있는지 확인
  User.findOne({email:req.body.email})

  //DB에 입력한 이메일값과 일치하는 데이터가 있으면 파라미터로 입력한 이메일과 일치하는 유저 정보를 받을 수 있음
  .then(async(user) => {
    if(!user) throw new Error('요청받은 이메일에 해당하는 가입자가 없음');
    // console.log(user)

    //입력되는 이메일과 일치하는 유저가 있으면 comparePassword(수정가능)메서드로 입력되는 비번을 인자로 전달
    const isMatch = await user.comparePassword(req.body.password);
    // console.log(isMatch)
    return {isMatch, user}
  }).then(({isMatch, user}) => {
    if(!isMatch){ //비밀번호가 일치하지않으면 에러출력
      throw new Error('비밀번호 틀림');
    }
    return user.generateToken(); //토큰을 생성시키기 위한 메서드며 user에 generateToken 호출
  })
  .then((user) => { //generateToken에 생성된 토큰으르 user파라미터로 받음
    //토큰을 쿠키로 저장 res.cookie(쿠키이름, 쿠키에 저장할 데이터(토큰))
    return res.cookie('x_auth', user.token)
    .status(200) //200성공숫자
    //쿠키 정장이 성공하면 DB의 _id값을 전달
    .json({
      loginSuccess: true,
      userId: user._id,
    })
  })
  .catch((err) => {
    return res.status(400).json({
      loginSuccess: false,
      message: err.message,
    })
  })
})

//auth미들웨어 = 콜백함수가 호출되기 전에 인증처리하는 메서드
app.get('/api/users/auth', auth, (req,res) => {
//auth.js에서 next()호출되면 auth미들웨어에서 코드의 실행이 콜백함수로 이동
//여기까지 왔다는건 Auth가 true임
res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role == 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    role: req.user.role,
    image: req.user.image, //이미지는 없으니 안 나옴(postman)
  })
})

app.get('/api/users/logout', auth, (req,res) => { //로그아웃
  //DB에서 id로 user를 찾고, token을 초기화
  User.findOneAndUpdate({ _id:req.user._id },{ token: "" }) //{선택},{삭제}
  .then(()=>{ //응답
    console.log(req.user._id);
    res.status(200).send({success: true}); //로그아웃에 성공하면 success:true반환
  }).catch((err)=>{
    res.json({ success:false, err }) //실패하면 false와 에러객체 반환
  })
})

app.listen(port, () => { //최하단에 위치해야함
  console.log(`포트번호 ${port}`);
})


// =========================================
// const express = require('express');
// const app = express();
// const port = 5000;
// const { User } = require('./models/user');

// const mongoose = require('mongoose');
// mongoose.connect('mongodb+srv://dddddum:gamongo**@cluster0.itxff.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
// .then(() => console.log('connect!'))
// .catch(err => console.log(err));

// app.get('/', (req, res) => {
//   const user = new User(req.body);
//   console.log(user);
//   //User 모델의 인스턴스를 생성했고 데이터가 비어있어서 기본값 role:0과 _id값을 자동생성
//   res.send('Hello');
// })

// app.listen(port, ()=>{
//   console.log(`포트번호 ${port}`);
// })