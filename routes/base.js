const express = require('express');
const Joi = require('joi');

const login = {
  body: {
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }
};

/**
 * Base ctrl
 */
module.exports = (app, wrapper, config, middlewares, services) => {
  const db = app.get('db');
  const router = express.Router();
  const validators = services.validators;

  /**
   * Home action
   */
  router.get('/', wrapper(async (req, res) => {
    const user = await db.model('User').findOne({ name: 'Toby' });
    console.log(user.name);
    res.render('base/index.html');
  }));

  /**
   * Login to system
   */
  router.post('/login', middlewares.validation(validators.login), wrapper(async (req, res) => {
    res.send('Success');
  }));

  app.use('/', router);
};
