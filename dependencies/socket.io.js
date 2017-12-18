const bluebird = require('bluebird');
/**
 * Sockets controll
 */
module.exports = (io, db) => {

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

    const redis = require("redis");
    bluebird.promisifyAll(redis.RedisClient.prototype);
    bluebird.promisifyAll(redis.Multi.prototype);
    client = redis.createClient();

    client.on("error", function (err) {
      console.log("Error " + err);
    });

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
        client.set(`sockdat:${fields.userId}`, socket.id, function(err, result) {
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
    socket.on('chat message', async function(message) {
      const {content, chatId} = message;
      const user = socket.handshake.userData;

      const [foundUser, {members}] = await Promise.all([
        db.model('User').findActiveUser(user._id),
        db.model('Chat').getMembers(chatId)
      ]);

      if (!(foundUser instanceof Object)) {
        return socket.emit('disallow writing', 'You cannot write');
      }

      // Check is user member of chat
      const membership = members.filter(m => m.user.toString() == user._id);
      if (membership.length < 1 || !(membership[0] instanceof Object)) {
        return socket.emit('disallow writing', 'Chat not found');
      }

      // Check that socket.id retreived from Redis exist in sockets.ids list yet
      // console.log(io.sockets.sockets[socket.id] instanceof Object);
    });

    /**
    * When user disconnected via sockets
    */
    socket.on('disconnect', function(){

    });
  });

};
