const redisClient = require('./redisClient');
const db = require('mongoose');
const app = require('./../app');

module.exports = (io) => {

  /**
   * Authorization middleware
   */
  io.use(async function (socket, next) {
    try {
      // Get cookie key
      const cookie = socket.handshake.headers.cookie;
      var sessKey = cookie.split(';').map(e => e.trim()).filter(e => e.startsWith('app:sess='))[0];
      sessKey = sessKey.substr(sessKey.indexOf('=') + 1);
    } catch (err) {
      return console.error('Unknown error. Socket connection cannot be runed');;
    }
    // Get user session-data
    const sessData = await redisClient.hgetallAsync(`sess:${sessKey}`);
    try {
      var userId = JSON.parse(sessData.passport).user;
    } catch (err) { // Not alowed connection by sockets
      console.log(err);
    }
    const user = await db.model('User').findActiveUser(userId);
    if (!(user instanceof Object)) {
      return console.log('Oh, user not found with such id');
    }
    socket.handshake.userData = user.toObject();

    // Save sess-id and socket.id for handy searching chat-members data while writing new message
    try {
      const result = await redisClient.setAsync(`socket:${userId}`, socket.id);
      if (result == 'OK') {
        next();
      } else {
        throw new Error('Socket key not saved');
      }
    } catch (err) {
      console.log(err);
    }
  });

  /**
   * Handle user's connection via sockets to server
   */
  io.on('connection', function (socket) {

    /**
     * Get new message from chat memeber
     */
    socket.on('chat:message', async function (data) {
      const {content, chatId} = data;
      const user = socket.handshake.userData;

      const [currUser, members] = await Promise.all([
        db.model('User').findActiveUser(user._id),
        db.model('Chat').getMembers(chatId)
      ]);
      if (!(currUser instanceof Object)) {
        return socket.emit('disallow writing', 'You cannot write');
      }

      var membershipIndex = -1;
      const membership = members.filter((member, index) => {
        if (member.userId == user._id) {
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
        var message = await db.model('Message').createMessage(chatId, user._id, content, members);
      } catch (err) {
        return console.log(err); // @TODO: Emit event error:create:message
      }
      // Remove current user from chat members
      members.splice(membershipIndex, 1);

      // Find user's socket.id by him user._id in Redis
      const membersSocketIds = await Promise.all(
        members.map(async member => {
          return await redisClient.getAsync(`socket:${member.userId}`);
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
      // @TODO remove socket-data from Redis
    });
  });

  /**
   * If user voluntarily has logouted from system
   */
  app.on('account:logouted', (socketId) => {
    io.to(socketId).emit('account:logouted');
  });
};