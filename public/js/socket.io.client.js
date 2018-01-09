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
    
    $.ajax({
      url: `/chats/${chatId}/write`,
      method: 'POST',
      data: {
        content: $('#messageContent').val(),
      }
    }).done(function(response) {
      console.log(response);
    }).fail(function(err) {
      console.log(err);
    });

    // $('#messageContent').val('');
    return false;
  });
});
