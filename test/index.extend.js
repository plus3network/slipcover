var sinon = require('sinon');
var should = require('should');
var app = require(__dirname+'/../index.js');

describe('index.js extend(object)', function () {

  it('should extend the object with the base object', function () {
    var App = app.extend({ });
    var object = new App();
    
    should.exist(object.app, 'missing app parameter');
    object.app.should.be.a('object');

    should.exist(object.transformers, 'missing transformers parameter');
    object.transformers.should.be.a('object');

    should.exist(object.mount, 'missing mount function');
    object.mount.should.be.a('function');

    should.exist(object.get, 'missing get function');
    object.get.should.be.a('function');

    should.exist(object.create, 'missing create function');
    object.create.should.be.a('function');

    should.exist(object.update, 'missing update function');
    object.update.should.be.a('function');

    should.exist(object.del, 'missing del function');
    object.del.should.be.a('function');

    should.exist(object.list, 'missing list function');
    object.list.should.be.a('function');
  });


  it('should extend the transformer parameter with the defaults', function () {
    var get = function (obj, callback) { console.log(object); callback(null, object); };
    var App = app.extend({ 
      transformers: {
        foo: function () { },
        get: get 
      }
    });

    var object = new App();

    should.exist(object.transformers.foo);
    object.transformers.foo.should.be.a('function');

    should.exist(object.transformers.get);
    object.transformers.get.should.be.a('function');
    object.transformers.get.should.eql(get);
  });
});
