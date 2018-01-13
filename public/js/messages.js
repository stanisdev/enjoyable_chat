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
    this.findUnread();
    this.saveUnread();
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
  /**
   * Find unread messages
   */
  findUnread() {
    const messages = $('div.unread');
    this.unreadIds = []; 
    if (messages.length > 0) {
      $.each(messages, (index, elem) => {
        this.unreadIds.push($(elem).attr('data-id'));
      });
    }
  }
  /**
   * Set unread messages as readed by sending msg-ids to server
   */
  saveUnread() {
    const {unreadIds} = this;
    if (!Array.isArray(unreadIds) || unreadIds.length < 1 || !window.chatId) {
      return;
    }
    $.ajax({
      url: `/chats/${chatId}/messages/status`,
      method: 'POST',
      data: {
        ids: unreadIds,
        status: 2
      }
    }).done((result) => {
      console.log(result);
    }).fail(() => {});
  }
}