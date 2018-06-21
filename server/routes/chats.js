const router = require('express').Router();
const app = require(process.env.app_file);
const config = require(process.env.config_path);
const services = require(config.services_path);
const asyncWrapper = services.wrapper;

router.get('/', asyncWrapper(async (req, res, next) => {
  res.json({
    success: true,
  });
}));

app.use('/chats', router);