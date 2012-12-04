var should = require('should');
var sinon = require('sinon');
var SlipCover = require(__dirname+'/../index');

describe('index.js SlipCover.prototype.mount(server)', function () {
  var server, app;
  
  beforeEach(function () {
    server = {
      get: sinon.stub(),
      post: sinon.stub(),
      put: sinon.stub(),
      del: sinon.stub(),
      head: sinon.stub()
    };

    var App = SlipCover.App.extend({ type: 'example' });
    app = new App({ conn: {} });
    app.mount(server);
  });

  afterEach(function () {
    server.get.reset();
    server.post.reset();
    server.put.reset();
    server.del.reset();
    server.head.reset();
  });

  it('should call server.get for the read route', function () {
    sinon.assert.calledTwice(server.get);
    server.get.args[1][0].should.eql('/example/:id');
    server.get.args[1][1].should.eql(app.get);
  });

  it('should call server.put for the put route', function () {
    sinon.assert.calledThrice(server.put);
    server.put.args[0][0].should.eql('/examples');
    server.put.args[0][1].should.eql(app.create);
    server.put.args[1][0].should.eql('/example');
    server.put.args[1][1].should.eql(app.create);
    server.put.args[2][0].should.eql('/example/:id');
    server.put.args[2][1].should.eql(app.update);
  });

  it('should call server.post for the post route', function () {
    sinon.assert.calledThrice(server.post);
    server.post.args[0][0].should.eql('/examples');
    server.post.args[0][1].should.eql(app.create);
    server.post.args[1][0].should.eql('/example');
    server.post.args[1][1].should.eql(app.create);
    server.post.args[2][0].should.eql('/example/:id');
    server.post.args[2][1].should.eql(app.update);
  });

  it('should call server.del for the put route', function () {
    sinon.assert.calledOnce(server.del);
    server.del.args[0][0].should.eql('/example/:id');
    server.del.args[0][1].should.eql(app.del);
  });


});
