const express = require('express'); // express 라이브러리 첨부
const app = express(); // 사용
//body-parser 사용하기 위해 아래 코드 추가
//body-parser라이브러리는 input에 넣은 내용을 해석할 수 있게?
app.use(express.urlencoded({extended: true})) 
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');

// mongo db 연결
var db;
var url = process.env.REACT_APP_URL;

MongoClient.connect(url,
//dababase 접속이 완료 되면
//8080에 nodejs 서버를 띄워라    
function(에러,client){
    if(에러) return console.log(에러);

    db= client.db('todoapp');

    // db.collection('post').insertOne({이름:"아이바오", 나이: 10}, function(에러,결과){
    //     console.log("저장완료");
    // })

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
//     //DB에 저장해주세요 요청하기
// })

//MongoDB 셋팅하기 - DB를 저장해보자

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
        //db 입력하기
        db.collection('post').insertOne({ _id: 총게시물갯수+1, 이름:요청.body.title, 날짜:요청.body.date }, function(에러,결과){
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

//delete 요청은 html에서 안된다
//그래서 요청하려면 1. method-override 라이브러리 이용 (node에서 사용할 수 있는)
//2. 자바스크립트 AJAX 사용 - 여기선 이거 이요할거임 
//AJAX는 새로고침없이 서버에 요청하는걸 도와주는 JS문법
 
//   ajax기본문법!
//   $.ajax({
//     method : 'POST',
//     url : '/add',
//     data : '결혼하기'
//   })

//스크립트에서
// 1. 버튼마다 번호달기
// 2. 클릭한 버튼 id 파악
// 3. 그걸 delete 요청시 함께 넣기
// app.delete('/delete', function(요청, 응답){
//     console.log(요청.body._id);
//     요청.body._id = parseInt(요청.body._id);
//     //요청body에 담긴 게시물 번호에 따라 db에서 게시물 삭제
//     db.collection('post').deleteOne(요청.body,function(에러,결과){
//         console.log('삭제완료');
//     })
//     응답.send('삭제완료');
// })

app.delete('/delete', function(요청, 응답){
    요청.body._id = parseInt(요청.body._id)
    db.collection('post').deleteOne(요청.body, function(에러, 결과){
      console.log('삭제완료')
    })
    응답.send('삭제완료')
  });