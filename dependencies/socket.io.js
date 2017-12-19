const redisClient = require(__dirname + '/redisClient');

/**
 * Sockets controll
 */
module.exports = (io, db, ee) => {

  /**
   * Authorization middleware
   */
  io.use(function(socket, next) {
    const cookie = socket.handshake.headers.cookie;
    var connectSid;
    var cookies;
    // Parse cookies to get sess-id
    try {
      cookies = cookie.split(';').map(e => e.trim()).filter(e => e.startsWith('connect.sid'));
      connectSid = cookies[0].substr(cookies[0].indexOf('=') + 1);
    } catch (err) {
      return console.error('Unknown error. Socket connection cannot be runed');;
    }
    const sessId = connectSid.substr(4, connectSid.indexOf('.') - 4);
    const client = redisClient.getClient();

    // Fetch session data by sess-id
    client.getAsync('sess:' + sessId).then(async (value) => {
      var fields;
      try {
         fields = JSON.parse(value);
      } catch (err) {
        return console.log(err);
      }
      if (fields instanceof Object && fields.hasOwnProperty('userId')) {

        const user = await db.model('User').findActiveUser(fields.userId);
        if (!(user instanceof Object)) {
          return console.log('Oh, user not found with such id');
        }
        socket.handshake.userData = user.toObject();

        // Save sess-id and socket.id for handy searching chat-members data while writing new message
        client.set(`sockdata:${fields.userId}`, socket.id.toString(), function(err, result) {
          if (err || result != 'OK') {
            return console.error(err);
          }
          next();
        });
      }
    }).catch((err) => {
      console.error(err);
    });

  });

  /**
   * Handle user's connection via sockets to server
   */
  io.on('connection', function(socket){

    /**
    * Get new message from chat memeber
    */
    socket.on('chat:message', async function(data) {
      const {content, chatId} = data;
      const user = socket.handshake.userData;

      const [currUser, {members}] = await Promise.all([
        db.model('User').findActiveUser(user._id),
        db.model('Chat').getMembers(chatId)
      ]);

      if (!(currUser instanceof Object)) {
        return socket.emit('disallow writing', 'You cannot write');
      }

      // Check is user member of chat
      var membershipIndex = -1;
      const membership = members.filter((m, index) => {
        if (m.user.toString() == user._id) {
          membershipIndex = index;
          return true;
        }
        return false;
      });
      if (membership.length < 1 || !(membership[0] instanceof Object)) {
        return socket.emit('disallow writing', 'Chat not found');
      }
      // Create message
      try {
        const message = await db.model('Message').createMessage(chatId, user._id, content, members);
      } catch (err) {
        return console.log(err); // @TODO: Emit event error:create:message
      }

      // Remove current user from chat members
      members.splice(membershipIndex, 1);

      // Find user's socket.id by him user._id in Redis
      const client = redisClient.getClient();

      const membersSocketIds = await Promise.all(
        members.map(async member => {
          let socketId = await client.getAsync('sockdata:' + member.user.toString()); // @TODO: toString() call once
          return socketId;
        })
      );

      // Send message to interlocutors
      for (let i = 0; i < membersSocketIds.length; i++) {
        let socketId = membersSocketIds[i];
        // Check that socket.id retreived from Redis exist in sockets.ids list yet
        if (io.sockets.sockets[socketId] instanceof Object) {
          console.log(socketId);
          socket.broadcast.to(socketId).emit('chat:message', content);
        }
      }
      
    });

    /**
    * When user disconnected via sockets
    */
    socket.on('disconnect', function(){
    });
  });

  /**
   * If user voluntarily has logouted from system
   */
  ee.on('user:logouted', ({socketId}) => {
    io.to(socketId).emit('user:logouted');
  });

};
