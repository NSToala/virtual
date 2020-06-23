(function(d, io, $) {
    'use strict'
    
    const socket = io()
    
    $("#autocomplete-input").keyup((event) => {
		let object = {
			autocomplete: event.target.value,
			uid: $('#uid').val()
		}
		
		socket.emit('autocomplete', object, users => {
			if(users.length == 0) {
				$('.users').empty().append("<div class='_noresult waves-effect'>No se encontró ningún contacto</div>")
			}else {
				autocomplete(users)
			}
		})
    })
    
    socket.on('connected', users => {
		if(users.length == 1) {
			$('.users').empty().append("<div class='_noresult waves-effect'>0 usuarios conectados</div>")
		}else {
			autocomplete(users)
		}
	})

	function autocomplete(users) {
		let elements = "", 
			uid = $('#uid').val() // id del usuario
		
		users.map((user, index) => {
			if(user.id_user != uid) {
				elements += `<div class="mb-2 chat waves-effect" id="${user.id_user}-${user.fullname}"><img class="circle" src="${user.photo}" /><span class='_user' id="${user.id_user}-${user.fullname}">${user.fullname}</span></div>`
			}else {

			}
		})
		
		$('.users').empty().append(elements)
		
		$('.chat').on('click',(event) => {
            $('.sidenav').sidenav('close')
            var data = event.target.id.split('-')

            var uid = $('#uid').val(),
                username = $('#fullname').val(),
                id_receiver = data[0],
                receiver = data[1]
            
            let room = [
                { id : uid, username: username, sr: id_receiver },
                { id: id_receiver, username: receiver, sr: uid}
            ]
            
            socket.emit('open chat', room)
            // socket.emit('new room', room)
		})
    }

	socket.on('create chat', users => {
		let uid = $('#uid').val(),
			url = ""
		
		users.map((user, index) => {
			if(user.id_user == uid) {
				// location.href = `/chatroom?name=${user.receiver}&room=${user.url_name}`
				url = `/chatroom?name=${user.receiver}&room=${user.url_name}`
			}
		})
		var iframe = document.createElement('iframe')
		iframe.setAttribute("src", url)
		
		$('.chatrooms').append(iframe)
    })
    
    $('.rooms').click(event => {
        localStorage.active = event.target.value
	})
	
})(document, io, jQuery)

function createUrl(sender, receiver) {
	alert(sender, receiver)
}