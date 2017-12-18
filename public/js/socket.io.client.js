$(() => {

  var socket = io();

  // Receive message from interlocutors
  socket.on('chat message', function(message){
    console.log(message);
  });

  $('#sendMessage').on('click', function() {
    socket.emit('chat message', {
      content: $('#messageContent').val(),
      chatId
    });
    $('#messageContent').val('');
    return false;
  });
});
