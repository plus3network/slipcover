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

describe('BeanBag.Model.prototype.get(rawObject, callback)', function () {

  var model, conn, transformers;
  beforeEach(function () {
    conn = {
      get: sinon.stub()
    };
    conn.get.yields(null, fakeRecord);

    transformers = {
      get: sinon.stub()
    };
    transformers.get.yields(null, fakeRecord);

    var Model = BeanBag.Model.extend({
      transformers: transformers
    });

    model = new Model({ conn: conn });
  });

  it('should call this.conn.get once', function (done) {
    model.get('a66c0000336711e281c10800200c9a66', function (err, record) {
      sinon.assert.calledOnce(conn.get);
      done();
    });
  });

  it('should call this.transforms.get once', function (done) {
    model.get('a66c0000336711e281c10800200c9a66', function (err, record) {
      sinon.assert.calledOnce(transformers.get);
      done();
    });
  });

});
