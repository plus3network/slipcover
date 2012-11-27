var should = require('should');
var sinon = require('sinon');
var BeanBag = require(__dirname+'/../index');

describe('BeanBag.create(req, res, next)', function () {
  
  var model, req, res, next, app;
  
  beforeEach(function () {
    model = { create: sinon.stub(), type: 'record' };
    req = { body: { name: 'Test', type: 'record' } };
    res = { send: sinon.stub() };
    next = sinon.stub();
    app = new BeanBag.App({ model: model });
  });
 
  it('should call model.create() with req.body', function () {
    app.create(req, res, next);
    sinon.assert.calledOnce(model.create);
    model.create.args[0][0].should.eql(req.body);
  });


  it('should call res.send with 201', function () {
    model.create.yields(null, req.body);
    app.create(req, res, next);
    sinon.assert.calledOnce(res.send);
    res.send.args[0][0].should.eql(201);
  });

  it('should call res.send with object', function () {
    model.create.yields(null, req.body);
    app.create(req, res, next);
    sinon.assert.calledOnce(res.send);
    res.send.args[0][1].should.eql(req.body);
  });

  it('should call next on error', function () {
    model.create.yields(new Error('True'));
    app.create(req, res, next);
    sinon.assert.calledOnce(next);
    next.args[0][0].should.be.an.instanceOf(Error);
  });

});
