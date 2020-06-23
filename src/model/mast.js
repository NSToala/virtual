'use strict'
const shortid = require('shortid'),
    connection = require('./connection'),
    Mast = () => {}

    Mast.connected = callback => connection.query('SELECT * FROM users WHERE status = 1', callback)

    Mast.disconnected = (data, callback) => connection.query('SELECT * FROM users WHERE status = 0 AND id_user = ?',data, callback)

    // Operaciones de chat
    Mast.getUserById = (data, callback) => connection.query('SELECT * FROM users WHERE id_user = ?', data, callback)

    Mast.verifyRoom = (data, callback) => {
        let rooms = [`${data[0].username}${data[0].id}-${data[1].username}-${data[1].id}`,`${data[1].username}${data[1].id}-${data[0].username}-${data[0].id}`]
        
        connection.query('SELECT * FROM rooms WHERE name in (?,?)', rooms, (err, response ) => {
            if(response.length == 0) {
                Mast.insertRoom([rooms[0], shortid.generate()], (err, chat) => {
                    let nested = []
                    data.map(( user, index) => {
                        nested[index] = { 'id': user.id, 'chatname': user.sr, 'idchat': chat[0].room }
                    })
                    
                    connection.query('INSERT INTO users_rooms (id_user, id_room, room) VALUES ?',[nested.map(item => [item.id, item.idchat, item.chatname])],(err) => {
                        if(!err) {
                            Mast.getRoomUsers(chat[0].room, callback)
                        }
                    })
                })
            }else {
                Mast.getRoomUsers(response[0].id_room, callback)
            }
        })
    }
    
    Mast.getRoomUsers = (data, callback) => {
        connection.query('SELECT u.id_user, u.fullname, u.photo, r.url_name, ur.room receiver  FROM users_rooms ur, rooms r, users u WHERE u.id_user = ur.id_user AND r.id_room = ur.id_room AND ur.id_room = ?', data, callback)
    }

    Mast.insertRoom = (data, callback) => {
        connection.query('INSERT INTO rooms (name, url_name, created_at) VALUES (?, ?, Now())', data, err => {
            connection.query('SELECT MAX(id_room) room FROM rooms', callback)
        }) 
    }
    

    // Operaciones de tanger live 
    Mast.insertTangerLive = (data, callback) => connection.query('INSERT INTO tanger_live(comentario) VALUES(?)', data, callback)

    Mast.getQuestions = (callback) => connection.query('SELECT * FROM tanger_live WHERE presentacion = 1 ORDER BY mostrada ASC, estado ASC, idtanger_live DESC',callback)

    Mast.updateTangerLive = (expert, callback) => (expert.state) ? connection.query('UPDATE tanger_live SET estado = 1, mostrada = 0 WHERE idtanger_live = ?',expert.id ,callback) : connection.query('UPDATE tanger_live SET estado = 0, mostrada = 1 WHERE idtanger_live = ?',expert.id ,callback)

    Mast.archive = (id, callback) => connection.query('UPDATE tanger_live SET presentacion = 0 WHERE idtanger_live = ?', id, callback)

    // Operaciones Survey
    Mast.saveSurvey = (data, callback) => connection.query('INSERT INTO surveys SET ?',data, callback)

    // Operaciones Votación
    Mast.getQuestionsVotacion = (callback) => connection.query('SELECT  * FROM voto_pregunta WHERE presentacion = 0', callback)

    //Operacion de upload images
    Mast.getPhotos = (callback) => connection.query('SELECT * FROM moments', callback)

    Mast.upload = (data, callback) => connection.query('INSERT INTO moments (path, created) VALUES (?, Now())', data, callback)

    Mast.insertPreguntaVotacion = (data, callback) => {
        connection.query('INSERT INTO voto_pregunta ( nombre ) VALUES (?)', data.question, (err) => {
            if(!err) 
                connection.query('SELECT MAX(idvoto_pregunta) AS id_pregunta FROM voto_pregunta', (err, rows) => {
                    let id = rows[0].id_pregunta, 
                    nested = []

                    data.answers.map(( answer, index) => {
                        nested[index] = { 'idvoto_pregunta': id , 'opcion' : answer }
                    })
                    
                    connection.query('INSERT INTO voto_respuesta( idvoto_pregunta, opcion ) VALUES ?',[nested.map(item => [item.idvoto_pregunta, item.opcion])],callback)
                })
            else 
                console.log(err) 
        })
    }

    Mast.updateVotacion = (id, callback) => connection.query('UPDATE voto_pregunta SET estado = 1 AND idvoto_pregunta = ?',id, callback)

    Mast.getQuestionsByState = (callback) => connection.query('SELECT vp.idvoto_pregunta, vp.nombre, vr.idvoto_respuesta, vr.opcion FROM voto_pregunta vp, voto_respuesta vr WHERE vr.idvoto_pregunta = vp.idvoto_pregunta AND vp.estado = 1', callback) 

    Mast.resetVotacion = (callback) => connection.query('UPDATE voto_pregunta SET estado = 0', callback)

    Mast.insertVoto = (data, callback) => connection.query('INSERT INTO voto_respondieron SET ?', data, callback)

    Mast.getVotosById = (id, callback) => connection.query('SELECT idrespuesta, COUNT(idrespuesta) repeticiones FROM voto_respondieron WHERE idvoto_pregunta = ? GROUP BY idrespuesta ORDER BY idrespuesta ASC', id, callback)

    Mast.archiveVotacion = (id, callback) => connection.query('UPDATE voto_pregunta SET presentacion = 1 WHERE idvoto_pregunta = ?', id, callback)

    //Operacion rating
    Mast.rating = (data, callback) => connection.query('INSERT INTO evaluaciones SET ?', data, callback)

    //Operaciones Wordcloud
    Mast.wordcloud = (data, callback) => connection.query('INSERT INTO words SET ?', data, callback)

    Mast.getWords = callback => connection.query('SELECT words, COUNT(*) AS repetition FROM words WHERE id_wordcloud = 1 GROUP BY words HAVING COUNT(*) > 0', callback)

    Mast.autocomplete = (data, callback) => {
        let sql = `SELECT * FROM users WHERE status = 1 AND id_user != ${data.uid} AND fullname like '%${data.autocomplete}%'`
        connection.query(sql, callback)
    }

    //Operacion Reports
    Mast.generateReport = (callback) => connection.query('SELECT ponencias.id_ponencia,ponencias.tema, ponencias.ponente, SUM(evaluaciones.valor) total, COUNT(evaluaciones.id_evaluacion) num FROM ponencias, evaluaciones WHERE ponencias.id_ponencia = evaluaciones.id_ponencia GROUP BY evaluaciones.id_ponencia',callback) 

    Mast.close = () => connection.end()

module.exports = Mast