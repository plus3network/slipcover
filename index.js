var _ = require('underscore');
var util = require('util');
var inflection = require('inflection');
var app = require('./lib/app');
var routes = require('./lib/routes');

var defaultTransformers = {
  get: function (record, callback) { callback(null, record); },
  list: function (records, callback) { callback(null, records); },
  update: function (record, callback) { callback(null, record); },
  create: function (record, callback) { callback(null, record); }
};


var base = function (options) {
  this.options = options || {};
  this.type = this.options.type || this.type || 'record';

  // Setup the default routes
  var defaultRoutes= {};
  defaultRoutes[util.format('GET /%s', inflection.pluralize(this.type))] = 'list';
  defaultRoutes[util.format('GET /%s/:id', inflection.singularize(this.type))] = 'get';
  defaultRoutes[util.format('PUT /%s/:id', inflection.singularize(this.type))] = 'create';
  defaultRoutes[util.format('POST /%s/:id', inflection.singularize(this.type))] = 'update';
  defaultRoutes[util.format('DELETE /%s/:id', inflection.singularize(this.type))] = 'del';
  this.routes = _.extend(defaultRoutes, this.routes);

  if(this.initalized && typeof(this.initialize) === 'function') {
    this.initialize.call(this, options);
  }
};

base.prototype = _.extend(routes, base.prototype);

base.prototype.app = app;

base.prototype.mount = function (server) {
  var keys = Object.keys(this.routes);
  keys.forEach(function (route) {
    var parts = route.split(/ /);
    if(parts.length === 2 && parts[0] && ~['HEAD','GET','PUT','POST','DELETE'].indexOf(parts[0])) {
      // if the verb is DELETE we need to convert it to del for compatibility
      // sake since delete is a keyword.
      var verb = (parts[0] === 'DELETE')?  'del' : parts[0].toLowerCase();  

      // Now that we have the verb and route we need to hook it up to the callback
      if(this[route] && typeof(this[route]) === 'function') {
        server[verb](parts[1], this[route]);
      }
    }
  });
};

module.exports.extend = function (object) {
  object = _.extend(base, object);
  object.prototype.transformers = _.extend(defaultTransformers, object.transformers);
  return object;
};
