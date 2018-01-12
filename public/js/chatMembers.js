$(() => {

  /**
   * Load friends that is not exists in chat yet
   */
  $('#addInterlocutor').on('click', () => {
    
    $.ajax({
      url: `/users/friends?chat_id${chatId}`,
      method: 'GET',
    }).done((data) => {
      // Add to list of friends

    }).fail(() => {});
  });
});