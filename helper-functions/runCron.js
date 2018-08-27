module.exports = {
  runCron(interval, cb) {
    return setInterval(cb, interval);
  },
  clearCron(timeout, cb) {
    clearInterval(timeout);
    cb("stopped");
  }
};
