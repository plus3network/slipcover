var _       = require('underscore');
var schema = require('schemajs');

module.exports.get = function (id, callback) {
  this.conn.get(id, function (err, object) {
    if (err) {
      return callback(err);
    }

    this.transformers.get(object, callback);
  });
};


module.exports.list = function (options, callback) {
  this.conn.view('clubhouses', 'getSponsors', {
    include_docs: true,
    reduce: false,
    limit: options.limit || 20,
    skip: options.skip || 0 
  }, function (err, body) {
    if (err) {
      return callback(err);
    }

    var results = _.map(body.rows, function (row) {
      return row.doc;
    });

    this.transformers.list(results, callback);
  });
};



module.exports.create = function (rawObject, callback) {
  this.transformers.create(rawObject, function (err, object) {
    var check = this.model.validate(object);
    if (!check.valid) {
      var keys = Object.keys(check.errors);
      return callback(new Error(check.errors[keys[0]]));
    }
      
    object.created_on = new Date();
    this.conn.insert(object, function (err, data) {
      if (err) {
        return callback(err);
      }

      object._id = data.id;
      object._rev = data.rev;

      this.transformers.get(object, callback);
    });
  });
};

module.exports.update = function (rawObject, callback) {
  
  if (!rawObject._id) {
    return callback(new Error('_id is a required parameter'));
  }

  if (!rawObject._rev) {
    return callback(new Error('_rev is a required parameter'));
  }

  this.transformers.update(rawObject, function (err, object) {
    var check = this.model.validate(object);
    if (!check.valid) {
      var keys = Object.keys(check.errors);
      return callback(new Error(check.errors[keys[0]]));
    }

    object.updated_on = new Date();
    this.conn.insert(object, object._id, function (err, data) {
      if (err) {
        return callback(err);
      }

      object._rev = data.rev;

      this.transformers.get(object, callback);
    });
  });
};

module.exports.del = function (id, callback) {
  this.conn.get(id, function (err, object) {
    if (err) {
      return callback (err);
    }

    this.conn.destroy(id, object._rev, function (err, body) {
      if (err) {
        return callback(err);
      }

      callback(null, body);
    });
  });
};
