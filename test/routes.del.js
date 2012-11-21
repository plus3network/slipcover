var should = require('should');
var sinon = require('sinon');
var BeanBag = require(__dirname+'/../index');

var fakeResponse = {
  ok: true,
  rev: '1-9df92dc0338b11e281c10800200c9a66'
};

describe('BeanBag.del(req, res, next)', function () {
  
  var model, req, res, next, app;
  
  beforeEach(function () {
    model = { del: sinon.stub() };
    req = { params: { id: '9df92dc0338b11e281c10800200c9a66' } };
    res = { send: sinon.stub() };
    next = sinon.stub();
    app = new BeanBag.App({ model: model });
  });
 
  it('should call model.del() with req.body', function () {
    app.del(req, res, next);
    sinon.assert.calledOnce(model.del);
    model.del.args[0][0].should.eql(req.params.id);
  });


  it('should call res.send with 204', function () {
    model.del.yields(null, req.body);
    app.del(req, res, next);
    sinon.assert.calledOnce(res.send);
    res.send.args[0][0].should.eql(204);
  });

  it('should call res.send with object', function () {
    model.del.yields(null, fakeResponse);
    app.del(req, res, next);
    sinon.assert.calledOnce(res.send);
    res.send.args[0][1].should.eql(fakeResponse);
  });

  it('should call next on error', function () {
    model.del.yields(new Error('True'));
    app.del(req, res, next);
    sinon.assert.calledOnce(next);
    next.args[0][0].should.be.an.instanceOf(Error);
  });

});
