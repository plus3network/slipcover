var should = require('should');
var sinon = require('sinon');
var SlipCover = require(__dirname+'/../index');
var _ = require('underscore');

var fakeRecord = {
  _id: 'a66c0000336711e281c10800200c9a66',
  _rev: '1-b8f24770336711e281c10800200c9a66',
  created_on: new Date(),
  name: 'Test User', 
  type: 'record' 
};

var fakeResponse = { 
  ok: true,
  id: 'a66c0000336711e281c10800200c9a66', 
  rev: '2-b8f24770336711e281c10800200c9a66'
};

describe('SlipCover.Model.prototype.update(rawObject, callback)', function () {

  var model, conn, transformers;
  beforeEach(function () {
    conn = {
      insert: sinon.stub()
    };
    conn.insert.yields(null, fakeResponse);

    transformers = {
      update: sinon.stub(),
      get: sinon.stub()
    };
    transformers.update.yields(null, fakeRecord);
    transformers.get.yields(null, fakeRecord);

    var Model = SlipCover.Model.extend({
      transformers: transformers
    });

    model = new Model({ conn: conn });
  });

  it('should call the this.conn.insert method once', function (done) {
    model.update(fakeRecord, function (err, record) {
      sinon.assert.calledOnce(conn.insert);
      done();
    });
  });

  it('should call the this.conn.insert with the record', function (done) {
    model.update(fakeRecord, function (err, record) {
      conn.insert.args[0][0].should.eql(fakeRecord);
      done();
    });
  });

  it('should call the this.conn.insert with the record._id', function (done) {
    model.update(fakeRecord, function (err, record) {
      conn.insert.args[0][1].should.eql(fakeRecord._id);
      done();
    });
  });

  it('should set the updated_on parameter', function (done) {
    model.update(fakeRecord, function (err, record) {
      should.exist(conn.insert.args[0][0].updated_on);
      done();
    });
  });

  it('should fail if _id is null', function (done) {
    model.update(_.omit(fakeRecord, '_id'), function (err, record) {
      should.exist(err);
      err.should.be.an.instanceOf(Error);
      err.message.should.eql('_id is a required parameter');
      done();
    });
  });

  it('should fail if _rev is null', function (done) {
    model.update(_.omit(fakeRecord, '_rev'), function (err, record) {
      should.exist(err);
      err.should.be.an.instanceOf(Error);
      err.message.should.eql('_rev is a required parameter');
      done();
    });
  });

  it('should call the this.transformers.update', function (done) {
    model.update(fakeRecord, function (err, record) {
      sinon.assert.calledOnce(transformers.update);
      done();
    });
  });

  it('should call the this.transformers.get', function (done) {
    model.update(fakeRecord, function (err, record) {
      sinon.assert.calledOnce(transformers.get);
      done();
    });
  });
  
  it('should fail validation if invalid', function (done) {
    var Model = SlipCover.Model.extend({
      schema: { test: { type: 'string', required: true }}
    });
    var model = new Model({ conn: conn });
    model.update(fakeRecord, function (err, record) {
      should.exist(err);
      err.should.be.an.instanceOf(Error);
      err.message.should.eql('test is a required parameter');
      done();
    });
  });

});
