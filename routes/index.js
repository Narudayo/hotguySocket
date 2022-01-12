const express = require('express')

const Room = require('../schemas/room')

const router = express.Router()

router.get('/', async (req, res, next) => {
    try{
        const rooms = await Room.find({});
        res.render('index', {rooms : rooms})
    }catch(error){
        console.error(error)
        next(error)
    }
})

router.get('/room', (req, res) => {
    res.render('room', {title : '상남자들의방생성'})
})

router.post('/room', async (req, res, next) => {
    try{
        const newRoom = await Room.create({
            title: req.body.title,
            owner: req.session.color,
            password: req.body.password
        })

        const io = req.app.get('io')  // => app.set('io',io)로 저장했던 io 객체를 가져옴.
        io.of('/').emit('newRoom', newRoom)
        res.redirect(`/room/${newRoom._id}?password=${req.body.password}`)

    }catch (error){
        console.error(error)
        next(error)
    }
})

router.get('/room/:id', async (req, res, next) => {
    try{
        const room = await Room.findOne({_id: req.params.id})
        // const io = req.app.get('io')

        if (!room)  return res.redirect('/?error=존재하지 않는 방이다')
        if (room.password && room.password !== req.query.password) return res.redirect('/?error=암호가틀렸다')

        return res.render('play', {room : room,
                                    session : req.session.color})
        
    }catch (error){
        console.error(error)
        return next(error)
    }
})

router.delete('/room/:id', async (req, res, next) => {
    try{
        await Room.remove({ _id: req.params.id})
        res.send('ok')
        setTimeout( () => {
            req.app.get('io').of('/').emit('removeRoom', req.params.id)
        }, 2000)
    }catch (error){
        console.error(error)
        next(error)
    }
})

router.post('/room/:id/play', (req, res, next) => {
    try{
        const action = req.body.action
        const player = req.session.color
        const id = player.substring(1)

        if(action == 'startFight'){
            const materials ={
                player1 : `player${id}`,
                player2 : req.body.opponent,
            }

            req.app.get('io').of('/play').to(req.params.id).emit('startFight',materials)
            res.send('ok')
        }

        if(action == 'move'){
            const keycode = req.body.keycode
            let x = req.body.x
            let y = req.body.y
            let message = ""

            if(keycode==87) {
                if(y==0) message = '올라갈 수 없습니다.'
                else y -= 10
            }
            if(keycode==83) {
                if(y==470) message = '내려갈 수 없습니다.'
                else y += 10
            } 
            if(keycode==65){
                if(x==0) message = '왼쪽으로 갈 수 없습니다.'
                else x -= 10
            }
            if(keycode==68){
                if(x==470) message = '오른쪽으로 갈 수 없습니다.'
                else x += 10
            }

            const play = {
                player : id,
                action : action,
                posix : x,
                posiy : y,
                msg : message
            }

            req.app.get('io').of('/play').to(req.params.id).emit('play',play)
            res.send('ok')
        }

        if(action =='imjoin'){
            const play = {
                player : id
            }

            req.app.get('io').of('/play').to(req.params.id).emit('imjoin',play)
            res.send('ok')
        }

        if(action == 'attack'){
            const keycode = req.body.keycode
            let x = req.body.x
            let y = req.body.y

            const play = {
                player : id,
                oppoID : req.body.oppoID,
                hit_position : req.body.hit_position,
                is_hit : req.body.is_hit,
                action : action,
                posix : x,
                posiy : y,
                keycode : keycode,
            }

            req.app.get('io').of('/play').to(req.params.id).emit('play',play)
            res.send('ok')
        }
        
    }catch (error){
        console.error(error)
    }
})

module.exports = router