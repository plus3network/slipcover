var sinon = require('sinon');
var should = require('should');
var SlipCover = require(__dirname+'/../index.js');

describe('index.js extend(object)', function () {

  it('should extend the object with the base object', function () {
    var App = SlipCover.Model.extend({ });
    var object = new App({ conn: {} });
    
    should.exist(object.get, 'missing get function');
    object.get.should.be.a('function');

    should.exist(object.create, 'missing create function');
    object.create.should.be.a('function');

    should.exist(object.update, 'missing update function');
    object.update.should.be.a('function');

    should.exist(object.del, 'missing del function');
    object.del.should.be.a('function');

  });

  it('should extend the transformer parameter with the defaults', function () {
    var get = function (obj, callback) { console.log(object); callback(null, object); };
    var Model = SlipCover.Model.extend({ 
      transformers: {
        foo: function () { },
        get: get 
      }
    });

    var object = new Model({ conn: {} });

    should.exist(object.transformers.foo);
    object.transformers.foo.should.be.a('function');

    should.exist(object.transformers.get);
    object.transformers.get.should.be.a('function');
    object.transformers.get.should.eql(get);
  });

  it('should set the type parameter', function () {
    var App = SlipCover.App.extend({ type: 'test' });
    var object = new App({ conn: {} });
    should.exist(object.type);
    object.type.should.eql('test');
  });

});
