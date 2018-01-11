/**
 * Messages interaction
 */
class Messages {
  /**
   * Init class
   */
  constructor() {
    this.list = $('div.messages-list');
    window.onerror = function(err) { // Catching exceptions
      alert(err.substr(err.indexOf(':') + 2));
      return true;
    };
  }
  /**
   * Append message as last
   * @param {String} content 
   */
  append({content, author}) {
    if (typeof content != 'string' || content.length < 1) {
      throw new Error('Put some text inside message');
    }
    this.list.append(`<div class="message-body">${author.name}: ${content}</div>`);
  }
  /**
   * Validate message after receiving
   * @param {Object} message
   */
  validateReceived(message) {
    try {
      var isValid = (
        message instanceof Object && message.content.length > 0 && 
        message.author.name.length > 0
      );
      if (!isValid) {
        throw new Error('Message not valid');
      }
    } catch (err) {
      return false;
    }
    return true;
  }
  /**
   * Send message to chat
   * @param {String} content 
   */
  send(content) {
    return new Promise((res, rej) => {
      $.ajax({
        url: `/chats/${chatId}/write`,
        method: 'POST',
        data: {
          content
        }
      }).done(res).fail(rej);
    });
  }
}