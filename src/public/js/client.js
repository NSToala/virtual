$(document).ready(function() {
	var socket = io.connect(),
		respuestas = $('.respuestas'),
		res = $('.collection'),
		pre = $('.pregunta'),
		votacion = $('.votacion'),
		votacion_response = $('.votacion-response'),
		reloj = $('#reloj_cuenta'),
		settime = ''

	// createUrl("demo1", "demo2")
	showVideoById("video 1")

	$('.sidenav').sidenav();

	$('.submit-expert').on('click', (event) => {
		event.preventDefault()
		if($('#question_expert').val() != "") {
			envio_pregunta()
		}else {
			console.log("Lo sentimos, el campo de pregunta no puede ir vacio!")
		}		
	})

	$('.logout').on('click', () => {
		let uid = $('#uid').val()

		socket.emit('disconnect', uid)
	})

	$('.submit-wordcloud').on('click', (event) => {
		event.preventDefault()
		let wordcloud = $('#wordcloud').val()
		$('#canvas').addClass('hide')

		if(wordcloud != "") {
			let word = {
				words: wordcloud, 
				id_wordcloud: 1
			}
			
			socket.emit("wordcloud", word, response => {
				if(response) {
					M.toast({html: 'Palabra agregada!', classes: 'rounded teal'});
					$('#wordcloud').val("")
					setTimeout(() => { 
						$('#canvas').removeClass('hide')
					}, 500)
				}
			})
		}else {
			console.log("Lo sentimos, el campo de pregunta no puede ir vacio!")
		}		
	})

	socket.on('hay alerta',data => {
		if (data.option) {
			$('.msg-txt').text(data.msg);
			$('.msg-alert').removeClass("oculto");
			setTimeout(() => {
				$('.msg-txt').text("");
				$('.msg-alert').addClass("oculto");
			},8000);
		}else{
			$('.msg-alert').addClass("oculto");
		}
	})

	socket.on('hay voteo', data => {
		if(data.state == '1') {
			res.empty()
			votacion_response.addClass('hide')
			votacion.removeClass('hide animate__fadeOut').addClass('animate__fadeIn')
			pre.empty().html(data.questions[0].nombre)

			$.map(data.questions, (question, index) => {
				res.append(`<div class='collection-item ci-${question.idvoto_respuesta}'><label for='radio-${question.idvoto_respuesta}'><input class='with-gap css-checkbox' name='votacion' type='radio' id='radio-${question.idvoto_respuesta}' value='${question.idvoto_respuesta}' /><span>${question.opcion}</span></label></div>`)
			})

			clearTimeout(settime)
			reloj.val(60)
			cuenta_regresiva()
			
			$('.css-checkbox').off()				
			$('.css-checkbox').on('click', event => {
				var id = event.target.value
				$(`.ci-${id}`).addClass('active text-white')
				socket.emit('voto',{ id_respuesta :id, id_pregunta: data.questions[0].idvoto_pregunta })	
				$('.votacion').removeClass('animate__fadeIn').addClass('animate__fadeOut')
				pongo_off()

				setTimeout(() => { 
					$('.votacion').addClass('hide')
					$('.votacion-response').removeClass('hide')	
				}, 500)
				
				pre.empty().html(data.questions[0].nombre)
				respuestas.empty()

				$.map(data.questions, (question, index) => {
					respuestas.append(
					`<div class='row'>
						<div class='col-12 format'>${question.opcion}</div>
						<div class='col-10'>
							<div class='progress red lighten-4'>
								<div class='determinate red darken-4' id='progressbar-${question.idvoto_respuesta}'></div>
							</div>
						</div>
						<div class='col-2'>
							<div class='porcentaje-${question.idvoto_respuesta}  percent'></div>
						</div>
					</div><hr />`)
				})
			})
		}else {
			$('._vote').addClass('hide')
		}
	});
	
	socket.on('calculando',(data, total) => {
		$.map(data, (key, index) => {
			let percent = ( key * 100 ) / total
			
			$(`#progressbar-${index}`).animate({ width: `${percent}%` }, 1000 )
			$(`.porcentaje-${index}`).html( `${Math.round(percent)}%`)
		})
	})

	function pongo_off(){
		$('.css-checkbox').off().prop('disabled',true)
		$('.gracias').show()
	}
	
	function cuenta_regresiva(){
		var num = reloj.val()
		num <= 0 ? pongo_off() : num--
		
		reloj.val(num)
		$('.reloj').html(num)
		settime = setTimeout(() => { cuenta_regresiva() }, 1000)
	}

	function envio_pregunta(){
		$('.msg-1').html('Su pregunta se esta enviando<br /> Espere por favor...');
		$(".mandando-pregunta").removeClass('oculto');
		
		var pregunta = $('#question_expert').val()
		var user = $("#usuario").val();
		
		setTimeout(function(){
			socket.emit("pregunta live",{user:user,pregunta:pregunta},data => {
				if (data) {
					$("#pregunta-ponente").val("");
					$(".txt-enviando").addClass('oculto');
					$('.msg-2').text("Su pregunta se envío con éxito.");
					$(".txt-confirmado").removeClass('oculto');

					setTimeout(function(){
						$(".menu-option, .menu").hide();
						$(".mandando-pregunta").addClass('oculto');
						$(".txt-enviando").removeClass('oculto');
						$(".txt-confirmado").addClass('oculto');
						$('.experto').addClass('oculto');
						$('.pag-inicio').removeClass('oculto');
						$('#current').val('pag-inicio');
						$('.close').addClass('oculto');
					},2000);
				};
			});
		}, 2000);
	}	

	socket.on('refresh',() => {
		location.reload();
	})
})

function showVideoById(id) {
	alert(id)
}