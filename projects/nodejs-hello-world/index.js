// set $IOPIPE_TOKEN in environment variables
// find your token at dashboard.iopipe.com/install
const iopipe = require('@iopipe/iopipe')();

exports.handler = iopipe((event, context) => {
  // log custom metrics for IOpipe search + alerting
  const log = context.iopipe.log;
  log('custom-metric', 100);

  // create custom traces
  const mark = context.iopipe.mark;
  mark.start('test-trace');
  // some code you want to measure
  mark.end('test-trace');

  context.succeed('Hello World!');
});
