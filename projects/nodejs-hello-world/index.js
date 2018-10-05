// set $IOPIPE_TOKEN in environment variables
// find your token at dashboard.iopipe.com/install
const iopipe = require('@iopipe/iopipe')();

exports.handler = iopipe((event, context) => {
  const { label, mark, metric } = context.iopipe;

  // label invocations to view invocations based on function behavior
  label('special-invocation');

  // create custom traces
  mark.start('test-trace');
  // some code you want to measure
  mark.end('test-trace');

  // create custom metrics to expose app info to IOpipe search + alerting
  metric('custom-metric', 99);
  metric('another-metric', 'a handy string here');

  context.succeed('Hello World!');
});
