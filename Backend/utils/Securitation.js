const requestIp = require("request-ip");

module.exports.securize = function (app, ipAllowed) {
  app.use((req, res, next) => {
    var remoteIp = requestIp.getClientIp(req);
    if (remoteIp) {
      var aIp = remoteIp.split(":");
      remoteIp = aIp[aIp.length - 1];
    }
    if (ipAllowed != "") {
      var remote = ipAllowed;
      var ips = remote.split(",");
      for (var i = 0; i < ips.length; i++) {
        if (ips[i] == remoteIp) {
          req.session.remoteIp = remoteIp;
          session.remoteIp = remoteIp;
          next();
          return;
        }
      }
      res.sendStatus(404);
      return;
    } else {
      session.remoteIp = remoteIp;
      next();
      return;
    }
  });
};
