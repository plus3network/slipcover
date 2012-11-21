module.exports.list = function (req, res, next) {
  var limit = req.query.limit || 20;
  var start = ((req.query.page || 1)-1)*limit;
  
  var options = {
    limit: limit,
    skip: start 
  };

  this.model.list(options, function (err, objects) {
    if (err) {
      return next(err);
    }

    res.send(200, objects);
  });
};

module.exports.get = function (req, res, next) {
  this.model.get(req.params.id, function (err, object) {
    if (err) {
      return next(err);
    }

    res.send(200, object);
  });
};

module.exports.create = function (req, res, next) {
  this.model.create(req.body, function (err, object) {
    if (err) {
      return next(err);
    }

    res.send(201, object);
  });
};

module.exports.update = function (req, res, next) {
  this.model.update(req.body, function (err, object) {
    if (err) {
      return next(err);
    }

    res.send(201, object);
  });
};

module.exports.del = function (req, res, next) {
  this.model.del(req.params.id, function (err, resp) {
    if (err) {
      return next(err);
    }

    res.send(204, resp);
  });

};
