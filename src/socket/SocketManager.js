const socket = require('socket.io'),
    mast = require('../model/mast'),
    {isRealString} = require('./utils/isRealString'),
    {generateMessage, generateLocationMessage} = require('./utils/message'),
    {Users} = require('./utils/users')
const { use } = require('passport')
const Mast = require('../model/mast')
const { response } = require('express')
let io,
    users = new Users()

exports.listen = server => {
    io = socket.listen(server)
    io.sockets.on('connection', socket => {
        initializeConnection(socket)
        /**************** Chat Application  ****************/
        socket.on('open chat', data => {
            // console.log(data)
            mast.verifyRoom(data, (err, rows) => {
                if(!err)
                   io.sockets.emit('create chat', rows)
            })
        })

        socket.on('join', (params, callback) => {
            // console.log(params)
            if(!isRealString(params.name) || !isRealString(params.room)){
              return callback('Name and room are required');
            }
            
            socket.join(params.room);
            users.removeUser(socket.id);
            users.addUser(socket.id, params.name, params.room)
            
            Mast.getUserById(params.name, (err, user) => {
                if(!err) {
                    // io.to(params.room).emit('updateUsersList', user)
                    // socket.emit('newMessage', generateMessage('Admin', `Welocome to ${params.room}!`))
                    socket.emit('updateUsersList', user)
                    // socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', "New User Joined!"))                
                    callback()
                }
            })
          })
        
          socket.on('createMessage', (message, callback) => {
            let user = users.getUser(socket.id);
            
            if(user && isRealString(message.text)){
                io.to(user.room).emit('newMessage', generateMessage(message.name, message.from, message.text, message.photo))
            }
            callback('This is the server:');
          })
        
          socket.on('disconnect', () => {
            let user = users.removeUser(socket.id);
        
            if(user) {
            //   io.to(user.room).emit('updateUsersList', users.getUserList(user.room));
            //   io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left ${user.room} chat room.`))
            }
          });
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