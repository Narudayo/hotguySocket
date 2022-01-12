const express = require('express')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const dotenv = require('dotenv')
const path = require('path')
const nunjucks = require('nunjucks')
const ColorHash = require('color-hash').default

dotenv.config()
const webSocket = require('./socket')
const indexRouter = require('./routes')
const connect = require('./schemas')

const app = express()
app.set('port', process.env.PORT || 7007)
app.set('view engine', 'html')
nunjucks.configure('views', {
    express: app,
    watch: true,
})
connect()

const sessionMiddleware = session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false
    }
})

app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
//  36,37 => 요청 본문 데이터 해석해서 req.body로 만들어줌.
app.use(cookieParser(process.env.COOKIE_SECRET))
// 39 => 요청에 동봉된 쿠키 해석해서 req.cookies로 만들어줌
app.use(sessionMiddleware)

app.use((req, res, next) => {
    // sessionID를 color 형식으로 바꿔준다.
    if(!req.session.color){
        const colorHash = new ColorHash()
        req.session.color = colorHash.hex(req.sessionID)
    }
 next()
})

app.use('/', indexRouter)

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 잘못된 요청 경로`)
    error.status = 404
    next(error)
})

const server = app.listen(app.get('port'), () => {
    console.log(app.get('port'), '에서 대기 중')
})

webSocket(server, app, sessionMiddleware)