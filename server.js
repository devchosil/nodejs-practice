const express = require('express'); // express 라이브러리 첨부
const app = express(); // 사용
//body-parser 사용하기 위해 아래 코드 추가
//body-parser라이브러리는 input에 넣은 내용을 해석할 수 있게?
app.use(express.urlencoded({extended: true})) 
require('dotenv').config();

// mongo db 연결
var db;
var url = process.env.REACT_APP_URL;
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect(url,
//dababase 접속이 완료 되면
//8080에 nodejs 서버를 띄워라    
function(에러,client){
    if(에러) return console.log(에러);

    db= client.db('todoapp');

    db.collection('post').insertOne({이름:"아이바오", 나이: 10}, function(에러,결과){
        console.log("저장완료");
    })

    app.listen(8080, function(){  
        console.log("listening on 8080")
    })
})

// //app.listen은 원하는 포트에 서버를 오픈하는 문법
// app.listen(8080, function(){  
//     console.log("listening on 8080")
// })

// 요청을 처리하는 기계 제작하기
// - 누군가가 /pet으로 방문하면 pet 안내문을 띄워주자
app.get('/pet',function(요청,응답){
    응답.send('pet 용품 쇼핑 사이트 입니다.')
});

app.get('/beuty',function(요청,응답){
    응답.send('뷰티페이지')
});

app.get('/',function(요청,응답){
    응답.sendFile(__dirname+'/index.html');
});

app.get('/write',function(요청,응답){
    응답.sendFile(__dirname+'/write.html');
});

// POST요청으로 서버에 데이터 전송하고 싶으면
//1. body-parser 필요
//2. form데이터의 경우 input에 name쓰기
//3. 요청.body라고 적으면 요청했던 formp에 적힌 데이터 수신가능
//                         ↓ input에 입력한 정보는 여기 있음(요청)
// app.post('/add',function(요청, 응답){
//     응답.send('전송완료');
//     console.log(요청.body);
//     //DB에 저장해주세요 요청하기
// })

//MongoDB 셋팅하기 - DB를 저장해보자
//잠깐 복습
// 1. /write 접속하면 <form> 나옴
// 2. 전송버튼 누르면 /add로 POST 요청함
// 3. (서버) 누가 /add로 POST 요청하면 뭔가 해주면됨

//웹사이트 기능만들기 기본
// 1. 서버로 데이터 전송할 수 있는 ui 개발
// 2. 서버에서 원하는대로 정보 처리
app.post('/add',function(요청, 응답){
    응답.send('전송완료');
    //요청.body.date는 중요 정보니까 어딘가 저장해야 되겠지?

})
