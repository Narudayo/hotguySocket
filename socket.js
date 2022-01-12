const SocketIO = require('socket.io')
const cookieParser = require('cookie-parser')
const axios = require('axios')
const cookie = require('cookie-signature')


module.exports = (server, app, sessionMiddleware) => {
    const io = SocketIO(server, {path: '/socket.io'})
    app.set('io', io)   // 라우터에서 io 객체 사용할 수 있도록, req.app.get('io')로 접근
    const room = io.of('/room')
    const play = io.of('/play')

    // io.use((socket, next) => {
    //     // 소켓명령이 올 때마다 수행.
    //     cookieParser(process.env.COOKIE_SECRET)(socket.request, socket.request.res, next)
    //     sessionMiddleware(socket.request, socket.request.res, next)
    // })

    room.on('connection', (socket) => {
        console.log('room 네임스페이스 접속')
        socket.on('disconnect', () => {
            console.log('room 네임스페이스 해제')
        })
    })

    play.on('connection', (socket) => {
        console.log('play 네임스페이스 접속')
        const req = socket.request
        const { headers: {referer} } = req  // 현재 웹 페이지의 url
        const roomId = referer
            .split('/')[referer.split('/').length -1]
            .replace(/\?.+/, '')
        socket.join(roomId) // join을 통해 해당 경로의 방(room)에 접속할 수 있다.
        socket.to(roomId).emit('join', {    // emit은 모든 유저에게 정보 전달.
            // 해당 방의 html,css 정보 전달 필요
        })

        socket.on('disconnect', () => {
            console.log('play 네임스페이스 접속 해제')
            socket.leave(roomId)    // 방 떠나기.
            // socket.adapter.room 에는 참여중인 socket 정보들이 들어있다.
            const currentRoom = socket.adapter.rooms[roomId]
            const userCount = currentRoom ? currentRoom.length : 0
            if (userCount === 0){
                // const signedCookie = cookie.sign(req.signedCookies['connect.sid'], process.env.COOKIE_SECRET)
                // const connectSID = `${signedCookie}`
                // connectSID는 해당 세션의 쿠키값을 알 수 있다.
                axios.delete(`http://121.190.73.96:7007/room/${roomId}`)
                .then(() => {
                    console.log('방 제거 요청 성공')
                })
                .catch((error) => {
                    console.error(error)
                })
            } else {
                socket.to(roomId).emit('exit', {
                    // 유저가 떠났다는 형식의 데이터 전달 필요
                })
            }
        })
    })

    // play.on('play', (socket) => {
    //     const req = socket.request
    //     console.log(req,'의액션을 취했다.')
    // })
}