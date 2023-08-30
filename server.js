const express = require('express'); // express 라이브러리 첨부
const app = express(); // 사용
//body-parser 사용하기 위해 아래 코드 추가
//body-parser라이브러리는 input에 넣은 내용을 해석할 수 있게?
app.use(express.urlencoded({extended: true})) 
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

//passport 라이브러리 설치 사용
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session()); 

// 암호화 기능
const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

app.set('view engine', 'ejs');

// mongo db 연결
var db;
var url = process.env.REACT_APP_URL;

MongoClient.connect(url,
//dababase 접속이 완료 되면, 8080에 nodejs 서버를 띄워라    
function(에러,client){
    if(에러) return console.log(에러);

    db= client.db('todoapp');

    app.listen(8080, function(){  
        console.log("listening on 8080")
    })
})

// 요청을 처리하는 기계 제작하기
// - 누군가가 /pet으로 방문하면 pet 안내문을 띄워주자
app.get('/pet',function(요청,응답){
    응답.send('pet 용품 쇼핑 사이트 입니다.')
});

app.get('/',function(요청,응답){
    응답.render('index.ejs');
    // 응답.sendFile(__dirname+'/index.html');
});

app.get('/write',function(요청,응답){
    응답.render('write.ejs');
    //응답.sendFile(__dirname+'/write.html');
});


// 아이디, 비번을 인증해주는 코드. 복붙하고 수정해서 쓰기
passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
//console.log(입력한아이디, 입력한비번);

db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {

if (에러) return done(에러)
if (!결과) {
    return done(null, false, { message: '존재하지않는 아이디요' })
} else {
    const passwordOk = bcrypt.compareSync(입력한비번, 결과.pw);
    // console.log(passwordOk);

    if(passwordOk) {
        return done(null, 결과)
    }  else {
        return done(null, false, { message: '비번틀렸어요' })
    }
    
}
})
}));

passport.serializeUser(function (user, done) {
done(null, user.id)
});

//deserializeUser는 로그인한 유저의 세션아이디를 바탕으로 개인정보를 db에서 찾는 역할
passport.deserializeUser(function (아이디, done) {
db.collection('login').findOne({id: 아이디}, function(에러, 결과) {
    done(null, 결과)
})
});

//웹사이트 기능만들기 기본
// 1. 서버로 데이터 전송할 수 있는 ui 개발
// 2. 서버에서 원하는대로 정보 처리
app.post('/add',function(요청, 응답){
    //응답.send() 이부분은 성공하든 실패하든 항상 존재해야함. 아니면 서버 멈춤
    //메세지 같은걸 보내주기 싫다면 간단한 응답코드 or 리다이렉트(페이지강제이동)를 해주는 코드도 있음
    응답.send('전송완료');

    //db 꺼내기 - 딱 하나만 찾으면 fineOne사용
    //이렇게 하는 이유: 전체 게시물 갯수+1하면 delete했을때 숫자가 바뀌기 때문에 고유한 id값이 안돼서 따로 관리해줌
    db.collection('counter').findOne({name: '게시물갯수'}, function(에러, 결과){
        var 총게시물갯수 = 결과.totalPost;

        var 저장할거 = {
            _id: 총게시물갯수,
            이름: 요청.body.title,
            날짜: 요청.body.date,
            작성자: 요청.user._id
            // 요청.user하면 로그인한 사람 정보가 나옴
        }
        //db 입력하기
        db.collection('post').insertOne(저장할거, function(에러,결과){
            //글 발행할때 count 올려줘야 하니까 insertOne안에 넣어주기!!!
            db.collection('counter').updateOne( {name : '게시물갯수' } , { $inc : { totalPost : 1 } } , function(에러, 결과){
                if(에러){return console.log(에러)}
                console.log('수정완료')
            })
        })
    });
})

app.get('/list',function(요청, 응답){
    //DB에 저장된 post라는 collection의 모든(제목이 ~인 등등) 데이터를 꺼내주세요
    //find().toArray()는 모든데이터
    db.collection('post').find().toArray(function(에러,결과){
        //                        ↓ 꺼낸 데이터 ejs파일에 집어넣기 - 1. db에서 자료찾고 2. 찾은걸 ejs파일에 집어넣기
        응답.render('list.ejs',{ posts: 결과}); //이 코드 위치 잘 확인!!
        console.log(결과);
    }); 
})

app.delete('/delete', function(요청, 응답){
    //본인 게시물만 삭제 가능하게
    요청.body._id = parseInt(요청.body._id)

    //두 조건이 만족하는 글만 삭제할 수 있게함
    var 삭제할데이터 = { _id: 요청.body._id, 작성자: 요청.user._id }

    db.collection('post').deleteOne(삭제할데이터, function(에러, 결과){
        console.log('삭제완료')
        //서버에서 요청 응답해주는 법
        // //서버에서 응답을 해줘야 ejs에서해서 done을 실행시킴
        응답.status(200).send({ message: '성공했습니다'});
    })
});

app.get('/detail/:id', function(요청,응답){
                                // params중 이름이 id인거
    db.collection('post').findOne({_id: parseInt(요청.params.id)}, function(에러, 결과){
        if(에러) {
            console.log(에러);
            응답.send({ message: '에러'});
        } else {
            console.log(결과);
            응답.render('detail.ejs', { data : 결과 })
        };
    })
})


app.get('/edit/:id', function(요청,응답){
                                                // params중 이름이 id인거
    db.collection('post').findOne({_id: parseInt(요청.params.id)}, function(에러, 결과){
        if(에러) {
            응답.send({ message: '에러'});
        } else {
            응답.render('edit.ejs', { data : 결과 })
        };
    })
})

app.put('/edit', function(요청,응답){
    //폼에 담긴 제목, 날짜데이터를 가지고 db.collection에다가 업데이트함
    db.collection('post').updateOne({ _id: parseInt(요청.body.id) },{ $set: { 이름:요청.body.title, 날짜:요청.body.date}},function(에러, 결과){
        응답.redirect('/list');
    })
});


//로그인 페이지로 라우팅
app.get('/login', function(요청,응답){
    응답.render('login.ejs');
})

//로그인 페이지에서 POST 요청을 할때 응답
app.post('/login', passport.authenticate('local', {
    failureRedirect : '/fail'
}),function(요청,응답){
    응답.redirect('/mypage')
})

//                    이게 미들웨어 사용하는 방법임
app.get('/mypage', 로그인했니 ,function(요청, 응답){
    console.log(요청.user);
    응답.render('mypage.ejs', { 사용자: 요청.user });
})

function 로그인했니(요청, 응답, next) {
    if(요청.user) {  //로그인 후 세션이 있으면 요청.user가 항상 있음
        next()
    } else {
        응답.send('로그인 안하셨어요')
    }
}

//회원가입 페이지
app.get('/signup', function(요청, 응답){
    응답.render('signup.ejs');
})

//회원가입 요청시
//흐름 : 회원가입 클릭(요청) -> db에 해당 id가 있는지 확인 -> 없으면 등록
app.post('/signup', function(요청, 응답){

    db.collection('login').findOne({ id: 요청.body.signUpId }, function(에러, 결과){

        // const password = 요청.body.signUpPw;
        if(!결과) {
            bcrypt.hash(요청.body.signUpPw, saltRounds, function(err, hash) {
                if (err) throw err;
                // Store 'hash' in the database
                db.collection('login').insertOne({ id: 요청.body.signUpId, pw: hash}, function(에러, 결과){
                    응답.redirect('/');
                })
            });
        } else {
            응답.send('중복된 아이디 입니다.')
        }
    })

})

// //암호화 기능 구현 flow
// 1. 저장할때 hash password
// 2. 불러올때 de

// // 서버에서 query string 꺼내는법
// app.get('/search', (요청, 응답)=>{
//     db.collection('post').find({$text: { $search: 요청.query.value}}).toArray((에러, 결과)=>{
//         응답.render('search.ejs',{posts: 결과});
//     })
// })

// Search Index에서 검색하는법
app.get('/search', (요청, 응답)=>{
    var 검색조건 = [
        {
            $search: {
            index: 'titleSearch',
            text: {
                query: 요청.query.value,
              path: '이름'  // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
            }
            }
        },
        // { $project : { 이름:1, _id:0, score: { $meta: "searchScore"}} },
        // { $sort : { _id : 1} },
        // 1은 오름차순 -1은 내림차순
    ] 
    db.collection('post').aggregate(검색조건).toArray((에러, 결과)=>{
        console.log(결과);
        응답.render('search.ejs',{posts: 결과});
    })
})

//app.use는 미들웨어 쓰고 싶을때 사용
// route 유지보수가 쉬워짐
app.use('/shop',require('./routes/shop.js'));