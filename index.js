var _ = require('underscore');
var util = require('util');
var inflection = require('inflection');
var app = require('./lib/app');
var routes = require('./lib/routes');


// The main constructor for the BeanBag object
var BeanBag = module.exports = function (options) {
  this.options = options || {};
  this.type = this.options.type || this.type || 'record';

  if(this.options.conn) {
    this.conn = options.conn;
  } else {
    throw new Error("You must provide a connection to CouchDB using options.conn.");
  }

  // Setup the default routes
  var defaultRoutes= {};
  defaultRoutes[util.format('GET /%s', inflection.pluralize(this.type))] = 'list';
  defaultRoutes[util.format('GET /%s/:id', inflection.singularize(this.type))] = 'get';
  defaultRoutes[util.format('PUT /%s', inflection.pluralize(this.type))] = 'create';
  defaultRoutes[util.format('POST /%s/:id', inflection.singularize(this.type))] = 'update';
  defaultRoutes[util.format('DELETE /%s/:id', inflection.singularize(this.type))] = 'del';
  this.routes = _.extend(defaultRoutes, this.routes);

  if(this.initialize && typeof(this.initialize) === 'function') {
    this.initialize.call(this, options);
  }
};

// Extend the BeanBag object with the default routes. 
BeanBag.prototype = _.extend(routes, BeanBag.prototype);

// Set the application methods
BeanBag.prototype.app = app;

// This will mount the applicaton to the Restify server.
BeanBag.prototype.mount = function (server) {
  var keys = Object.keys(this.routes);
  var self = this;
  keys.forEach(function (route) {
    var parts = route.split(/ /);
    if(parts.length === 2 && parts[0] && ~['HEAD','GET','PUT','POST','DELETE'].indexOf(parts[0])) {
      // if the verb is DELETE we need to convert it to del for compatibility
      // sake since delete is a keyword.
      var verb = (parts[0] === 'DELETE')?  'del' : parts[0].toLowerCase();  
      var action = self.routes[route];

      // Now that we have the verb and route we need to hook it up to the callback
      if(self[action] && typeof(self[action]) === 'function') {
        server[verb](parts[1], self[action]);
      }
    }
  });
};

// This function was heavliy inspired (as in copied) from Backbone.js. with the
// exception of the transformer extension code.
BeanBag.extend = function (protoProps, classProps) {
  var child = inherits(this, protoProps, classProps);
  child.extend = this.extend;
  child.prototype.transformers = _.extend(defaultTransformers, protoProps.transformers);
  return child;
};

// The default transformers that match up with the routes
var defaultTransformers = {
  get: function (record, callback) { callback(null, record); },
  list: function (records, callback) { callback(null, records); },
  update: function (record, callback) { callback(null, record); },
  create: function (record, callback) { callback(null, record); }
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
