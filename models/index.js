const mongoose = require('mongoose');
const glob = require('glob');

/**
 * Mongoose connection
 */
module.exports = (config) => {

  return {
    connect: () => {
      return new Promise((resolve, reject) => {

      });
    }
  };
};
