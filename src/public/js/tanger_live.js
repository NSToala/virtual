(function(d, io, $) {
    'use strict'
    $('.sidenav').sidenav()

    var socket = io(),
        divp = $('.filter'),
        dive = $('.div-experto')

    socket.on('experto', data => {
        divp.html(null)
        view_experto(data)

        $.map(data, (question, index) => {
            if(question.estado == '0') {
                let disable = (question.mostrada == '1') ? 'disable' : ''
                divp.append(`<div class='row collection-item ${disable} algo-${index}'><div class="col-md-8">${question.comentario}</div><div class="col-md-2 col-6"><button class="btn btn-mostrar waves-effect waves-light" id='${question.idtanger_live}-${question.estado}'><i class="material-icons right">visibility</i>Filtrar</button></div><div class="col-md-2 col-6"><button class="btn btn-archivar waves-effect waves-light" id='${question.idtanger_live}-${question.estado}'><i class="material-icons right">archive</i>Archivar</button></div></div>`)
            }else {
                divp.append(`<div class='row collection-item algo-${index}'><div class="col-md-10">${question.comentario}</div><div class="col-md-2 col-6"><button class="btn btn-mostrar waves-effect waves-light red" id='${question.idtanger_live}-${question.estado}'><i class="material-icons right">visibility_off</i>Remover</button></div></div>`)
            }
        })
        
        $('.btn-mostrar').on('click', event => {
            var id = event.target.id.split('-')
            socket.emit('update experto',id)
        })

        $('.btn-archivar').on('click',() => {
            var id = event.target.id.split('-')
            console.log(id)
            socket.emit('archivar',id[0])
        })
    })

    function view_experto(data) {
        dive.html(null)
        $.map(data, (question, index) => {
            if(question.estado == '1') 
                dive.append(`<div class='row collection-item'><span class='my-3'>${(index + 1)} .- ${question.comentario}</span></div>`)
        })
    }
})(document, io, jQuery)