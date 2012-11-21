var _ = require('underscore');
var util = require('util');
var schema = require('schemajs');
var inflection = require('inflection');
var routes = require('./lib/routes');

var BeanBag = {};
module.exports = BeanBag;

// The main constructor for the BeanBag object
BeanBag.App = function (options) {
  this.options = options || {};
  this.type = this.options.type || this.type || 'record';

  if (this.options.model && this.options.model instanceof BeanBag.Model) {
    this.model = this.options.model;
  } else {
    if(this.options.conn) {
      this.conn = this.options.conn;
    } else {
      throw new Error("You must provide a connection to CouchDB using options.conn.");
    }
    this.model = new BeanBag.Model({ conn: this.conn, type: this.type });
  }

  // Setup the default routes
  var defaultRoutes= {};
  defaultRoutes[util.format('GET /%s/:id', inflection.singularize(this.type))] = 'get';
  defaultRoutes[util.format('PUT /%s', inflection.pluralize(this.type))] = 'create';
  defaultRoutes[util.format('POST /%s/:id', inflection.singularize(this.type))] = 'update';
  defaultRoutes[util.format('DELETE /%s/:id', inflection.singularize(this.type))] = 'del';
  this.routes = _.extend(defaultRoutes, this.routes);

  if (this.initialize && typeof(this.initialize) === 'function') {
    this.initialize.call(this, options);
  }
};

// Extend the BeanBag object with the default routes. 
BeanBag.App.prototype = _.extend(BeanBag.App.prototype, routes);

// This will mount the applicaton to the Restify server.
BeanBag.App.prototype.mount = function (server) {
  var keys = Object.keys(this.routes);
  var self = this;
  keys.forEach(function (route) {
    var parts = route.split(/ /);
    if (parts.length === 2 && parts[0] && ~['HEAD','GET','PUT','POST','DELETE'].indexOf(parts[0])) {
      // if the verb is DELETE we need to convert it to del for compatibility
      // sake since delete is a keyword.
      var verb = (parts[0] === 'DELETE')?  'del' : parts[0].toLowerCase();  
      var action = self.routes[route];

      // Now that we have the verb and route we need to hook it up to the callback
      if (self[action] && typeof(self[action]) === 'function') {
        server[verb](parts[1], self[action]);
      }
    }
  });
};

// Set the application methods
BeanBag.Model = function (options) {
  this.options = options || {};
  this.type = this.options.type || this.type || 'record';

  if (this.options.conn) {
    this.conn = options.conn;
  } else {
    throw new Error("You must provide a connection to CouchDB using options.conn.");
  }

  if (this.initialize && typeof(this.initialize) === 'function') {
    this.initialize.call(this, options);
  }
};

BeanBag.Model.prototype.schema = { type: { type: 'string', required: true} };

BeanBag.Model.prototype.get = function (id, callback) {
  var self = this;
  this.conn.get(id, function (err, object) {
    if (err) {
      return callback(err);
    }

    self.transformers.get(object, callback);
  });
};



BeanBag.Model.prototype.create = function (rawObject, callback) {
  var self = this;
  this.transformers.create(rawObject, function (err, object) {
    var model = schema.create(self.schema);
    var check = model.validate(object);
    if (!check.valid) {
      var keys = Object.keys(check.errors);
      return callback(new Error(check.errors[keys[0]]));
    }
      
    object.created_on = new Date();
    self.conn.insert(object, function (err, data) {
      if (err) {
        return callback(err);
      }

      object._id = data.id;
      object._rev = data.rev;

      self.transformers.get(object, callback);
    });
  });
};

BeanBag.Model.prototype.update = function (rawObject, callback) {
  
  if (!rawObject._id) {
    return callback(new Error('_id is a required parameter'));
  }

  if (!rawObject._rev) {
    return callback(new Error('_rev is a required parameter'));
  }

  var self = this;

  this.transformers.update(rawObject, function (err, object) {
    var model = schema.create(self.schema);
    var check = model.validate(object);
    if (!check.valid) {
      var keys = Object.keys(check.errors);
      return callback(new Error(check.errors[keys[0]]));
    }

    object.updated_on = new Date();
    self.conn.insert(object, object._id, function (err, data) {
      if (err) {
        return callback(err);
      }

      object._rev = data.rev;

      self.transformers.get(object, callback);
    });
  });
};

BeanBag.Model.prototype.del = function (id, callback) {
  var self = this;
  this.conn.get(id, function (err, object) {
    if (err) {
      return callback (err);
    }

    self.conn.destroy(id, object._rev, function (err, body) {
      if (err) {
        return callback(err);
      }

      callback(null, body);
    });
  });
};


// The default transformers that match up with the routes
var defaultTransformers = BeanBag.Model.prototype.transformers = {
  get: function (record, callback) { callback(null, record); },
  update: function (record, callback) { callback(null, record); },
  create: function (record, callback) { callback(null, record); }
};

// This function was heavliy inspired (as in copied) from Backbone.js. with the
// exception of the transformer extension code.
BeanBag.Model.extend = BeanBag.App.extend = function (protoProps, classProps) {
  var child = inherits(this, protoProps, classProps);
  child.extend = this.extend;
  if (protoProps.transformers) {
    child.prototype.transformers = _.extend(defaultTransformers, protoProps.transformers);
  }
  return child;
};


/**
 *  THESE METHODS ARE BARROWED HEAVILY FROM Backbone.js
 */

// Shared empty constructor function to aid in prototype-chain creation.
var ctor = function(){};

// Helper function to correctly set up the prototype chain, for subclasses.
// Similar to `goog.inherits`, but uses a hash of prototype properties and
// class properties to be extended.
var inherits = function(parent, protoProps, staticProps) {
  var child;

  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call the parent's constructor.
  if (protoProps && protoProps.hasOwnProperty('constructor')) {
    child = protoProps.constructor;
  } else {
    child = function(){ parent.apply(this, arguments); };
  }

  // Inherit class (static) properties from parent.
  _.extend(child, parent);

  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function.
  ctor.prototype = parent.prototype;
  child.prototype = new ctor();

  // Add prototype properties (instance properties) to the subclass,
  // if supplied.
  if (protoProps) _.extend(child.prototype, protoProps);

  // Add static properties to the constructor function, if supplied.
  if (staticProps) _.extend(child, staticProps);

  // Correctly set child's `prototype.constructor`.
  child.prototype.constructor = child;

  // Set a convenience property in case the parent's prototype is needed later.
  child.__super__ = parent.prototype;

  return child;
};
