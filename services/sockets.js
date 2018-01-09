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

  /**
   * Chat new message event (send interlocutors)
   */
  app.on('chat:message', ({socketIds, message}) => {
    for (let i = 0; i < socketIds.length; i++) {
      let socketId = socketIds[i];

      // Check that socket.id retreived from redis exist in sockets.ids list yet
      if (io.sockets.sockets[socketId] instanceof Object) {
        io.sockets.sockets[socketId].emit('chat:message', message);
      }
    }
  });
};