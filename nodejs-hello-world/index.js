/*
 USAGE: set the IOPIPE_TOKEN env var to your project token
*/
'use strict';
const iopipe = require('@iopipe/iopipe')();

exports.handler = iopipe((event, context, callback) => {
  callback(null, "Hello World!");
});
