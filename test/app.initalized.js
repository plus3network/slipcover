var should = require('should');
var sinon = require('sinon');
var SlipCover = require(__dirname+'/../index');

describe('index.js app.initalize(options)', function () {

  var App, object, initializeStub, options;

  beforeEach(function () {
    initializeStub = sinon.stub();
    options = { conn: {}, type: 'example' };
    App = SlipCover.App.extend({
      initialize: initializeStub,
      routes: {
        'GET /example/:id/minimal': 'minimal'
      }
    });

    object = new App(options);
  });

  it('should set the type via options', function () {
    should.exist(object.type);
    object.type.should.eql('example');
  });

  it('should extend the routes', function () {
    should.exist(object.routes);
    var routes = Object.keys(object.routes);
    routes.should.be.length(6);
    routes.should.include('GET /examples');
    routes.should.include('GET /example/:id/minimal');
    routes.should.include('GET /example/:id');
    routes.should.include('PUT /examples');
    routes.should.include('POST /example/:id');
    routes.should.include('DELETE /example/:id');
  });

  it('should call the intialize() method with options', function () {
    sinon.assert.calledOnce(initializeStub); 
    initializeStub.args[0][0].should.eql(options); 
  });

  
});
