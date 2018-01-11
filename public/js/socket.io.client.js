$(() => {

  const socket = io();
  const msg = new Messages();

  // Receive message from interlocutors
  socket.on('chat:message', function(message) {
    if (!msg.validateReceived(message)) {
      return;
    }
    msg.append(message);
  });

  // Reaction if user exited from system
  socket.on('account:logouted', function() {
    window.location = "/";
  });

  $('#sendMessage').on('click', function() {
    const content = $('#messageContent').val();
    
    msg.send(content).then((result) => {
      if (!msg.validateReceived(result.data)) {
        return alert('Error while sending message');
      }
      if (result.success !== true) {
        return alert(
          result.hasOwnProperty('message') ? result.message : 'Uknown error'
        );
      }
      msg.append(result.data);
      $('#messageContent').val('');
    }).catch((err) => {
      alert('Message not sended');
    });
  });
});
