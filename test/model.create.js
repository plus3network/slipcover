var should = require('should');
var sinon = require('sinon');
var BeanBag = require(__dirname+'/../index');

var fakeRecord = {
  name: 'Test User', 
  type: 'record' 
};

var fakeResponse = { 
  ok: true,
  id: 'a66c0000336711e281c10800200c9a66', 
  rev: '1-b8f24770336711e281c10800200c9a66'
};

describe('BeanBag.Model.prototype.create(rawObject, callback)', function () {

  var model, conn, transformers;
  beforeEach(function () {
    conn = {
      insert: sinon.stub()
    };
    conn.insert.yields(null, fakeResponse);

    transformers = {
      create: sinon.stub(),
      get: sinon.stub()
    };
    transformers.create.yields(null, fakeRecord);
    transformers.get.yields(null, fakeRecord);

    var Model = BeanBag.Model.extend({
      transformers: transformers
    });

    model = new Model({ conn: conn });
  });

  it('should call the this.conn.insert method once', function (done) {
    model.create(fakeRecord, function (err, record) {
      sinon.assert.calledOnce(conn.insert);
      done();
    });
  });

  it('should call the this.conn.insert with record', function (done) {
    model.create(fakeRecord, function (err, record) {
      should.exist(conn.insert.args[0][0].created_on);
      done();
    });
  });

  it('should call this.transformer.create once', function (done) {
    model.create(fakeRecord, function (err, record) {
      sinon.assert.calledOnce(transformers.create);
      done();
    });
  });

  it('should call this.transformer.create with record', function (done) {
    model.create(fakeRecord, function (err, record) {
      sinon.assert.calledWith(transformers.create, fakeRecord);
      done();
    });
  });

  it('should call this.transformer.get once', function (done) {
    model.create(fakeRecord, function (err, record) {
      sinon.assert.calledOnce(transformers.get);
      record.should.eql(fakeRecord);
      done();
    });
  });

  it('should fail validation if invalid', function (done) {
    var Model = BeanBag.Model.extend({
      schema: { test: { type: 'string', required: true }}
    });
    var model = new Model({ conn: conn });
    model.create(fakeRecord, function (err, record) {
      should.exist(err);
      err.should.be.an.instanceOf(Error);
      err.message.should.eql('test is a required parameter');
      done();
    });
  });

});
