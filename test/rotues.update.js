var should = require('should');
var sinon = require('sinon');
var BeanBag = require(__dirname+'/../index');

var fakeResponse = {
  _id: 'a66c0000336711e281c10800200c9a66', 
  _rev: '1-b8f24770336711e281c10800200c9a66',
  created_on: new Date(),
  updated_on: new Date(),
  name: 'Test User', 
  type: 'record' 
};

describe('BeanBag.update(req, res, next)', function () {
  
  var model, req, res, next, app;
  
  beforeEach(function () {
    model = { update: sinon.stub(), type: 'record' };
    req = { body: fakeResponse };
    res = { send: sinon.stub() };
    next = sinon.stub();
    app = new BeanBag.App({ model: model });
  });
 
  it('should call model.update() with req.params.id', function () {
    app.update(req, res, next);
    sinon.assert.calledOnce(model.update);
    model.update.args[0][0].should.eql(req.body);
  });


  it('should call res.send with 201', function () {
    model.update.yields(null, fakeResponse);
    app.update(req, res, next);
    sinon.assert.calledOnce(res.send);
    res.send.args[0][0].should.eql(201);
  });

  it('should call res.send with object', function () {
    model.update.yields(null, fakeResponse);
    app.update(req, res, next);
    sinon.assert.calledOnce(res.send);
    res.send.args[0][1].should.eql(fakeResponse);
  });

  it('should call next on error', function () {
    model.update.yields(new Error('True'));
    app.update(req, res, next);
    sinon.assert.calledOnce(next);
    next.args[0][0].should.be.an.instanceOf(Error);
  });

});
