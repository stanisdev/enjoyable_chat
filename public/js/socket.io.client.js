$(() => {

  var socket = io();

  // Receive message from interlocutors
  socket.on('chat:message', function(message) {
    console.log(message);
  });

  // Reaction if user exited from system
  socket.on('account:logouted', function() {
    window.location = "/";
  });

  $('#sendMessage').on('click', function() {
    socket.emit('chat:message', {
      content: $('#messageContent').val(),
      chatId
    });
    $('#messageContent').val('');
    return false;
  });
});
