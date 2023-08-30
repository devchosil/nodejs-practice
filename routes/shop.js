var router = require('express').Router();


function 로그인했니(요청, 응답, next) {
    if(요청.user) {  //로그인 후 세션이 있으면 요청.user가 항상 있음
        next()
    } else {
        응답.send('로그인 안하셨어요')
    }
}

//모든 url에 적용할 미들웨어 사용할 수 있음
//아래처럼 써주면 모든 라우터에 로그인했니 미들웨어 적용가능
// router.use(로그인했니);

// shirts로 접속할때만 접속하게 하려면
router.use('/shirts',로그인했니);

// router 폴더 파일 관리
// 로그인한 사람만 방문가능하게 특정라우터 파일에 미들웨어 적용하고 싶으면
// 로그인했니 함수 가져와서 적용
router.get('/shirts', function(요청, 응답){
    응답.send('셔츠 파는 페이지입니다.');
 });
 
router.get('/pants', function(요청, 응답){
    응답.send('바지 파는 페이지입니다.');
 });

module.exports = router;