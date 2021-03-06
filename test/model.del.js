var should = require('should');
var sinon = require('sinon');
var SlipCover = require(__dirname+'/../index');
var _ = require('underscore');
var restify = require('restify');

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

describe('SlipCover.Model.prototype.del(rawObject, callback)', function () {

  var model, conn, transformers;
  beforeEach(function () {
    conn = {
      get: sinon.stub(),
      destroy: sinon.stub()
    };
    conn.destroy.yields(null, fakeResponse);

    var Model = SlipCover.Model.extend({});
    model = new Model({ conn: conn });
  });

  it('should call this.conn.get once', function (done) {
    conn.get.yields(null, fakeRecord);
    model.del('a66c0000336711e281c10800200c9a66', function (err, body) {
      sinon.assert.calledOnce(conn.get);
      done();
    });
  });

  it('should call this.conn.destory once', function (done) {
    conn.get.yields(null, fakeRecord);
    model.del('a66c0000336711e281c10800200c9a66', function (err, body) {
      sinon.assert.calledOnce(conn.destroy);
      done();
    });
  });

  it('should call this.conn.destory with _id', function (done) {
    conn.get.yields(null, fakeRecord);
    model.del('a66c0000336711e281c10800200c9a66', function (err, body) {
      conn.destroy.args[0][0].should.eql(fakeRecord._id);
      done();
    });
  });

  it('should call this.conn.destory with _rev', function (done) {
    conn.get.yields(null, fakeRecord);
    model.del('a66c0000336711e281c10800200c9a66', function (err, body) {
      conn.destroy.args[0][1].should.eql(fakeRecord._rev);
      done();
    });
  });

  it('should fail if the source object type doesnt match', function (done) {
    var object = _.clone(fakeRecord);
    object.type = 'foo';
    conn.get.yields(null, object);
    model.del('a66c0000336711e281c10800200c9a66', function (err, record) {
      err.should.be.an.instanceOf(restify.ResourceNotFoundError);
      done();
    });
  });


});
