var should = require('should');
var sinon = require('sinon');
var BeanBag = require(__dirname+'/../index');

var fakeRecord = {
  _id: 'a66c0000336711e281c10800200c9a66', 
  _rev: '1-b8f24770336711e281c10800200c9a66',
  created_on: new Date(),
  updated_on: new Date(),
  name: 'Test User', 
  type: 'record' 
};

var fakeResponse = {
  ok: true,
  rev: '1-b8f24770336711e281c10800200c9a66'
};

describe('BeanBag.Model.prototype.del(rawObject, callback)', function () {

  var model, conn, transformers;
  beforeEach(function () {
    conn = {
      get: sinon.stub(),
      destroy: sinon.stub()
    };
    conn.get.yields(null, fakeRecord);
    conn.destroy.yields(null, fakeResponse);

    var Model = BeanBag.Model.extend({});
    model = new Model({ conn: conn });
  });

  it('should call this.conn.get once', function (done) {
    model.del('a66c0000336711e281c10800200c9a66', function (err, body) {
      sinon.assert.calledOnce(conn.get);
      done();
    });
  });

  it('should call this.conn.destory once', function (done) {
    model.del('a66c0000336711e281c10800200c9a66', function (err, body) {
      sinon.assert.calledOnce(conn.destroy);
      done();
    });
  });

  it('should call this.conn.destory with _id', function (done) {
    model.del('a66c0000336711e281c10800200c9a66', function (err, body) {
      conn.destroy.args[0][0].should.eql(fakeRecord._id);
      done();
    });
  });

  it('should call this.conn.destory with _rev', function (done) {
    model.del('a66c0000336711e281c10800200c9a66', function (err, body) {
      conn.destroy.args[0][1].should.eql(fakeRecord._rev);
      done();
    });
  });


});
