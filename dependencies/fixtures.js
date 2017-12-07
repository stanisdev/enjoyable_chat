const mongoose = require('mongoose');
const bluebird = require('bluebird');
const config = require(__dirname + '/config.json');
const glob = require('glob');
const path = require('path');
const rootDir = path.dirname(__dirname);

mongoose.Promise = bluebird;

/**
 * Connect to DB before loading demo data
 */
mongoose.connect(`mongodb://${config.db.host}:${config.db.port}/${config.db.name}`, {
  useMongoClient: true,
  promiseLibrary: bluebird
}).then(async () => {

  const modelPathes = glob.sync(rootDir + "/models/**/!(index).js");
  modelPathes.forEach(path => {
    require(path)(mongoose);
  });

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
      role: 99
    }, {
      user: createdUsers[1]._id, // plain member
      role: 0
    }, {
      user: createdUsers[2]._id, // moderator
      role: 1
    }]
  }, {
    name: 'Politics',
    type: 1, 
    members: [{
      user: createdUsers[0]._id,
      role: 0
    }, {
      user: createdUsers[1]._id,
      role: 99
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

}).catch((err) => {
  console.log('Fixtures cannot be loaded');
  console.log(err);
});
