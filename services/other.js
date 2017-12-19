
module.exports = {

  /**
   * Parse cookies to get sess-id
   */
  getSessId(cookie) {
    var connectSid;
    var cookies;
    try {
      cookies = cookie.split(';').map(e => e.trim()).filter(e => e.startsWith('connect.sid'));
      connectSid = cookies[0].substr(cookies[0].indexOf('=') + 1);
    } catch (err) {
      return console.error('Unknown error. Socket connection cannot be runed');;
    }
    return connectSid.substr(4, connectSid.indexOf('.') - 4);
  }
};