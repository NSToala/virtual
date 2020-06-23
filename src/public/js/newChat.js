(function (d, io, $) {
  const socket = io();

  function scrollToBottom() {
    let container = $(".msger-chat"),
        scroll = container.prop("scrollHeight")

    $(container).animate({ scrollTop: scroll }, 'normal')
  }
  
  socket.on("connect", function () {
    let searchQuery = window.location.search.substring(1);
    let params = JSON.parse(
      '{"' +
        decodeURI(searchQuery)
          .replace(/&/g, '","')
          .replace(/\+/g, " ")
          .replace(/=/g, '":"') +
        '"}'
    );
    
    socket.emit("join", params, function (err) {
      if (err) {
        window.location.href = "/";
      } else {
        console.log("No Error");
      }
    });
  });

  socket.on("disconnect", function () {
    console.log("disconnected from server.");
  })

  socket.on("updateUsersList", user => {
      console.log(user)
      $('.chat-name').text(user[0].fullname)
  })

  socket.on("newMessage", message => {
    console.log(message)
    const formattedTime = moment(message.createdAt).format("LT")
    let position = ($('#uid').val() == message.from)? 'left-msg':'right-msg'
    
    var html = `<div class='msg ${position}'>
      <div class='msg-img' style='background-image: url(${message.photo})'></div>

      <div class='msg-bubble'>
        <div class='msg-info'>
          <div class='msg-info-name'>${message.name}</div>
          <div class='msg-info-time'>${formattedTime}</div>
        </div>

        <div class='msg-text'>${message.text}</div>
      </div>
    </div>`;
    
    $(".msger-chat").append(html);
    scrollToBottom();
  });

  $(".msger-inputarea").on("submit", (event) => {
    event.preventDefault()

    let msg = {
        from: $('#uid').val(),
        text: $('.msger-input').val(),
        name: $('#fullname').val(),
        photo: $('#photo').val()
    }

    if (msg.text != "") {
        socket.emit("createMessage", msg , () => {
            $(".msger-input").val("")
        })
    }
  })
})(document, io, jQuery)