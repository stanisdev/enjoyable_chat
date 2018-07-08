const router = require('express').Router();
const app = require(process.env.app_file);
const config = require(process.env.config_path);
const services = require(config.services_path);
const asyncWrapper = services.wrapper;
const {storage} = services;

storage.model('User').findAll();

router.post('/auth', asyncWrapper(async (req, res, next) => {
  res.json({
    success: true,
  });
}));

router.post('/create', asyncWrapper(async (req, res, next) => {
  res.json({
    success: true,
  });
}));

app.use('/users', router);