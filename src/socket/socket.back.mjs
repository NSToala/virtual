const socket = require('socket.io'),
    mast = require('../model/mast'),
    {Users} = require('./utils/users')
let io,
    users = new Users()

exports.listen = server => {
    io = socket.listen(server)
    io.sockets.on('connection', socket => {
        initializeConnection(socket)
        /**************** Chat Application  ****************/
        
        let room = "community"
        socket.join(room)
        socket.on("send message", data => {            
            socket.leave(room)
            socket.join(room)
            console.log(users)
            console.log(socket.id)
            users.removeUser(socket.id)
            console.log(socket.id)
            users.addUser(socket.id, data.sender, data.room)        
            console.log(users)
            // io.to(room).emit("new message", data);
            io.to(room).emit('new message', data)
            // io.sockets.in(room).emit("new message", data)
            // io.to(room).emit("new message", data)
            

            // io.sockets.to(room).emit("new message", data)

            // let socketId = data.receiver,
            //     message = {
            //         message: data.message,
            //         id_user: data.id_user,
            //         id_room: data.id_room
            //     }
            
            // User.insertMessage(message, err => {
            //     if(!err){
            //         console.log(channel)
            //         io.sockets.in(channel).emit("new message", data, channel)
            //     }
            // })        
            // // io.emit('new message', data);
        })

        socket.on('new room', data => {
            console.log(data)
            let rooms = [`${data[0].username}${data[0].id}-&${data[1].username}-${data[1].id}`,`${data[1].username}${data[1].id}-&${data[0].username}-${data[0].id}`]
    
            console.log(rooms)

        })


        /**************** End Chat Application  ****************/
        
        socket.on('pregunta live',(data, callback) => {
            mast.insertTangerLive(data.pregunta, err => {
                if(!err) {
                    experto()
                    callback(true)
                }else
                    console.log(err)                
            })                        
        })

        socket.on('update experto',(data) => {
            let qexpert = {
                id : data[0],
                state : !parseInt(data[1])
            }

            mast.updateTangerLive(qexpert , err => {
                if(!err) 
                    experto()
                else 
                    console.log(err)
            })
        });
        
        socket.on('archivar',(data) => {
            mast.archive(data , err => {
                if(!err) 
                    experto()
                else 
                    console.log(err)
            })
        });
        
        socket.on('archivar votacion',function (data) {
            mast.archiveVotacion(data , err => {
                if(!err) 
                    votacion()
                else 
                    console.log(err)
            })
        })

        //Alertas 
        socket.on('mando alerta', (data) => {
            io.sockets.emit('hay alerta', data)
        })

        //Encuesta 
        socket.on('save survey', ( survey, callback ) => {
            let surveys = { p_1: survey.data[0],p_2: survey.data[1],p_3: survey.data[2],p_4: survey.data[3],p_5: survey.data[4],p_6: survey.data[5] }
            
            mast.saveSurvey(surveys, err => {
                if(!err)
                    callback(true)            
            })
        })

        //Votación 
        socket.on('mando votacion', (data) => {
            //Este if envia la votación
            if(data.state == '1') {
                mast.updateVotacion(data.id, err => {
                    if(!err)
                        mast.getQuestionsByState((err, rows) => {
                            io.sockets.emit('hay voteo', { questions: rows, state: data.state })
                        })
                    else 
                        console.log(err) 
                })
            }else if(data.state == '0') { //Este else cierra el sistema de votación
                mast.resetVotacion(err => {
                    io.sockets.emit('hay voteo', { state: data.state })
                })
            }	
        })

        socket.on('voto',data => {
            let voto = { idvoto_pregunta : data.id_pregunta, idrespuesta : data.id_respuesta }
            
            mast.insertVoto(voto, err => {
                if(!err) 
                    mast.getVotosById(data.id_pregunta, (err, rows) => {
                        let votos = {},
                            total = 0
                    
                        rows.map((voto, index) => {
                            votos[voto.idrespuesta] = voto.repeticiones
                            total += voto.repeticiones
                        })
                        io.sockets.emit('calculando', votos, total)
                    })
                else 
                    console.log(err) 
            })
        })

        socket.on('add question', function( data, callback ) {
            mast.insertPreguntaVotacion(data, err => {
                if(!err)
                    callback(true)
                else
                    console.log(err) 
            })
        })

        //Rating ponencia
        socket.on("rating", (data, callback) => {
            let rating = { valor : data.rating[0], id_ponencia : data.rating[1] }
            
            mast.rating(rating, err => {
                if(!err) 
                    callback(true)
                else 
                    console.log(err)
            })
        })
        
        socket.on("wordcloud", (data, callback) => {
            mast.wordcloud(data, err => {
                if(!err) {
                    callback(true)
                    words()
                } else 
                    console.log(err)
            })
        })

        socket.on('autocomplete', (data, callback) => {
            mast.autocomplete(data, (err, rows) => {
                callback(rows)
            })
        })

        //Reload app
        socket.on('reloadApp',() => {
            io.sockets.emit('refresh')
        })

        socket.on('disconnect', data => {
            console.log(data)
            mast.disconnected(data, err => {
                if(!err)
                    users_connected()
            })
		})
    })
}

function initializeConnection(socket) {
    votacion(socket)
    users_connected(socket)
    words(socket)
    experto(socket)
    reportes(socket)
}

function words(socket) {    
    mast.getWords((err, rows) => {
        if(!err) {
            socket.emit('wordcloud', rows)
        } else 
            console.log(err)
    })
}

function users_connected(socket) {
    mast.connected((err, rows) => {
        if(!err) {
            io.sockets.emit('connected', rows)
        }else {
            console.log(err)
        }
    })
}

function votacion(socket) {
    mast.getQuestionsVotacion((err, rows)=> {
        if(!err) 
            socket.emit('votacion', rows)
        else 
            console.log(err) 
    })
}

function experto(socket) {
    mast.getQuestions((err, rows) => {
        if(!err) 
            io.sockets.emit('experto', rows)   
        else 
            console.log(err)                
    })
}

function reportes(socket) {
    mast.generateReport((err, rows) => {
        socket.emit('reportes', rows)
    })
}