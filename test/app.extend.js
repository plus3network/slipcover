var sinon = require('sinon');
var should = require('should');
var BeanBag = require(__dirname+'/../index.js');

describe('index.js extend(object)', function () {

  it('should extend the object with the base object', function () {
    var App = BeanBag.App.extend({ });
    var object = new App({ conn: {} });
    
    should.exist(object.model, 'missing model parameter');
    object.model.should.be.a('object');

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

  it('should set the type parameter', function () {
    var App = BeanBag.App.extend({ type: 'test' });
    var object = new App({ conn: {} });
    should.exist(object.type);
    object.type.should.eql('test');
  });

  it('should set the same type parameter for the model when it\'s not present', function () {
    var App = BeanBag.App.extend({ type: 'test' });
    var object = new App({ conn: {} });
    should.exist(object.type);
    object.type.should.eql('test');
    object.model.type.should.eql(object.type);
  });

});
