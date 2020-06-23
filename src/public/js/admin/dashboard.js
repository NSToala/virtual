(function(d, io, $) {
    'use strict'

    var socket = io(),
        not = $('#msg-notificacion')

    $('.save-questions').click(e => {
        e.preventDefault()
		let array = new Array(),
		    question = $('#pregunta').val()

		if(question != "") {
			$(".ip-1").each(function() { if($(this).val() != "" ) { array.push($(this).val()) } })	

	        if( array.length != 0 ) 
	        	if( array.length >= 2 ) 	        	
	        		socket.emit('add question', { question: question, answers: array }, data => {
	        			if(data) {
                            alert("Su pregunta ha sido agregada con éxito!")
                            location.href = '/admin/votacion'
	        			}
			        })
	        	else
		        	alert("lo sentimos, debes agregar por lo menos 2 respuestas!")	
	        else
	        	alert("lo sentimos, debes agregar respuestas!")
		}else 
			alert("lo sentimos, el campo de pregunta no puede estar vacio!")
	})
    
    $('.btn-reload').on('click',() => socket.emit('reloadApp'))

    socket.on('reportes', data => {
        let report = ''
        $.map( data, ( value, index ) => {
            report += `<div class='col-lg-8 col-sm-10 offset-lg-2 offset-sm-1 mb-3'><div class='card'><div class='card-body'><div class='card-ponencia mb-2'>${value.tema}</div><div class='card-title'>${value.ponente}</div><div class='score'>Calificación : ${(value.total / value.num).toFixed(1)}</div></div></div></div>`
        })

        $('.reportes_ponencias').empty().append(report)
    })

    socket.on('votacion', data => {
        let table = ''        
        if( data.length != 0 )
            $.map( data, ( value, index ) => {
                table += `<tr><td colspan='3'>${value.nombre}</td><td class='text-center'><div class='badge badge-success mandar-voteo' id='${value.idvoto_pregunta}'>Mandar</div></td><td class='text-center'><div class='badge badge-danger cerrar-voteo' id='${value.idvoto_pregunta}'>Cerrar</div></td><td class='text-center'><div class='badge badge-primary btn-archivar' id='${value.idvoto_pregunta}'>Archivar</div></td></tr>`
            })
        else
            table = "<tr><td colspan='6' class='text-center'>No hay datos...</td></tr>"

        $('#table').empty().append(table)

        $('.mandar-voteo').click(e => {
            e.preventDefault()
            let id = event.target.id            
            socket.emit('mando votacion', { state: 1, id: id })
        })

         $('.btn-archivar').on('click', e => {
            e.preventDefault()
            var id = event.target.id
            socket.emit('archivar votacion',id)
        })

        $('.cerrar-voteo').on('click', e => {
            e.preventDefault()
            var id = event.target.id            
            socket.emit('mando votacion', { state: 0, id: id })
        })
    })

    $('.notification').on('click', e => {
        e.preventDefault()
        let notification = { msg : not.val(), option  : (e.target.id == 1)? true : false }
        socket.emit('mando alerta', notification)
    })
})(document, io, jQuery)