const path = require('path');
process.env.ROOT_DIR = path.dirname(__dirname);
process.env.DB_LOGGING = false;

require('dotenv').config();
const modelsEmmiter = require('./../models');

// Connected
modelsEmmiter.on('done', async function() {
  const mongoose = require('mongoose');
  
  const UserModel = mongoose.model('User');
  const users = [{
    name: 'Toby',
    email: 'toby@gmail.com',
    password: 123,
    age: 30,
    state: 1
  }, {
    name: 'Sarah',
    email: 'sarah@gmail.com',
    password: 123,
    age: 40,
    state: 1
  }, {
    name: 'Paul',
    email: 'paul@gmail.com',
    password: 123,
    age: 25,
    state: 1
  }];

  await UserModel.remove();

  // Create users
  var createdUsers;
  try {
    createdUsers = await Promise.all(
      users.map(async (user) => {
        user = new UserModel(user);
        await user.save();
        return user;
      })
    );
  } catch (err) {
    console.log('Users cannot be created');
    return console.error(err);
  }
  console.log('Users created');

  // Chats
  const ChatModel = mongoose.model('Chat');
  const chats = [{
    name: 'Cozy Room',
    type: 1, // Group chat
    members: [{
      user: createdUsers[0]._id, // admin
      role: 99,
      is_deleted: false
    }, {
      user: createdUsers[1]._id, // plain member
      role: 0,
      is_deleted: false
    }, {
      user: createdUsers[2]._id, // moderator
      role: 1,
      is_deleted: false
    }]
  }, {
    name: 'Politics',
    type: 1,
    members: [{
      user: createdUsers[0]._id,
      role: 0,
      is_deleted: false
    }, {
      user: createdUsers[1]._id,
      role: 99,
      is_deleted: false
    }]
  }];

  await ChatModel.remove();

  // Chat creation
  var createdChats;
  try {
    createdChats = await Promise.all(
      chats.map(async (chat) => {
        chat = new ChatModel(chat);
        await chat.save();
        return chat;
      })
    );
  } catch (err) {
    console.log('Chats cannot be created');
    return console.error(err);
  }
  console.log('Chats created');

  // Set chats to users
  createdUsers[0].chats.push(
    createdChats[0]._id,
    createdChats[1]._id
  );

  createdUsers[1].chats.push(
    createdChats[0]._id,
    createdChats[1]._id
  );

  createdUsers[2].chats.push(
    createdChats[0]._id
  );

  // Save users chats relationships
  try {
    await Promise.all(createdUsers.map(async (user) => {
      await user.save();
      return;
    }));
  } catch (err) {
    console.log('Chats cannot be related to users');
    return console.error(err);
  }
  console.log('Chats related to users');

  // Messages creating
  const MessageModel = mongoose.model('Message');
  const messages = [{
    content: 'Hello there',
    type: 'text/plain',
    chat: createdChats[0]._id,
    author: createdUsers[1]._id,
    statuses: [{
      user: createdUsers[1]._id,
      value: 2
    }, {
      user: createdUsers[2]._id,
      value: 1
    }],
    created_at: new Date()
  }, {
    content: 'Second message',
    type: 'text/plain',
    chat: createdChats[0]._id,
    author: createdUsers[2]._id,
    statuses: [{
      user: createdUsers[1]._id,
      value: 2
    }, {
      user: createdUsers[0]._id,
      value: 2
    }, {
      user: createdUsers[2]._id,
      value: 2
    }],
    created_at: new Date()
  }];

  await MessageModel.remove();

  try {
    await Promise.all(
      messages.map(async (message) => {
        message = new MessageModel(message);
        await message.save();
        return null;
      })
    );
  } catch (err) {
    console.log('Messages cannot be created');
    return console.error(err);
  }
  console.log('Messages created');
  process.exit();
});
