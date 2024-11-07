const express = require("express")
const app = express();
const port = 5000;
const cors = require("cors")
//만들어 놨던 유저모델 객체를 가져옴
const { User } = require("./models/user");
const config = require('./config/dev');

app.use(cors())
app.use(express.json()) //body-parser가 express에 내장되어있으므로 바로 사용 가능

//mongoose를 이용해서 앱과 mongoDB를 연결
const mongoose = require('mongoose')
mongoose.connect(config.mongoURI)
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log(err))

app.get("/", async (req, res) => {
  res.send("Hello World")
})

//회원가입 할때 필요한 정보들을 client에서 가져오고 데이터베이스에 넣어준다.
app.post('/api/users/register', async (req, res) => {
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

app.listen(port, () => {
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