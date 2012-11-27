var should = require('should');
var sinon = require('sinon');
var SlipCover = require(__dirname+'/../index');

var fakeResponse = {
  _id: 'a66c0000336711e281c10800200c9a66', 
  _rev: '1-b8f24770336711e281c10800200c9a66',
  created_on: new Date(),
  updated_on: new Date(),
  name: 'Test User', 
  type: 'record' 
};

describe('SlipCover.get(req, res, next)', function () {
  
  var model, req, res, next, app;
  
  beforeEach(function () {
    model = { get: sinon.stub(), type: 'record' };
    req = { params: { id: 'a66c0000336711e281c10800200c9a66' } };
    res = { send: sinon.stub() };
    next = sinon.stub();
    app = new SlipCover.App({ model: model });
  });
 
  it('should call model.get() with req.params.id', function () {
    app.get(req, res, next);
    sinon.assert.calledOnce(model.get);
    model.get.args[0][0].should.eql(req.params.id);
  });


  it('should call res.send with 200', function () {
    model.get.yields(null, fakeResponse);
    app.get(req, res, next);
    sinon.assert.calledOnce(res.send);
    res.send.args[0][0].should.eql(200);
  });

  it('should call res.send with object', function () {
    model.get.yields(null, fakeResponse);
    app.get(req, res, next);
    sinon.assert.calledOnce(res.send);
    res.send.args[0][1].should.eql(fakeResponse);
  });

  it('should call next on error', function () {
    model.get.yields(new Error('True'));
    app.get(req, res, next);
    sinon.assert.calledOnce(next);
    next.args[0][0].should.be.an.instanceOf(Error);
  });

});
