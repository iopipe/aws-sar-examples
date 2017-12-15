/*
 USAGE: set the IOPIPE_TOKEN env var to your project token
*/
'use strict';
const iopipeTrace = require('@iopipe/trace'),
      iopipe = require('iopipe')({
        plugins: [iopipeTrace]
      });

module.exports.handler = iopipe((event, context, callback) => {
  callback(null, "Hello World!");
});
