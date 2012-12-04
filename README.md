SlipCover
=======

A framework for creating a data model web service layer on top CouchDB using Restify.

### Features

* Integrates with [Nano](https://github.com/dscape/nano), [Restify](http://mcavage.github.com/node-restify/) and [SchemaJS](https://github.com/eleith/schemajs)
* Easily create CRUD web services for document types
* Familar Backbone like interface
* Extend and overide basic interaces with ease

### Installing

```
npm install slipcover
```

### Built In Routes

The SlipCover.App class comes with some built in routes based on the model type

```
Method   Route                  Function
-------------------------------------------------------
GET     /<plural type>          SlipCover.App.list()
GET     /<plural type>/:id      SlipCover.App.get()
PUT     /<plural type>          SlipCover.App.create()
POST    /<plural type>          SlipCover.App.create()
POST    /<plural type>/:id      SlipCover.App.update()
PUT     /<plural type>/:id      SlipCover.App.update()
DELETE  /<plural type>/:id      SlipCover.App.del()
```

The above using `user` as the `type` would look like this:

```
Method   Route                   Function
-------------------------------------------------------
GET     /users                   SlipCover.App.list()
GET     /users/:id               SlipCover.App.get()
PUT     /users                   SlipCover.App.create()
POST    /users                   SlipCover.App.create()
POST    /users/:id               SlipCover.App.update()
PUT     /users/:id               SlipCover.App.update()
DELETE  /users/:id               SlipCover.App.del()
```

Each SlipCover.App method has a coresponding SlipCover.model method that matches. So for SlipCover.App.get() there is a coresponding SlipCover.Model.get() that matches.

### Example

```javascript
var restify = require('restify');
var nano = require('nano')('http://localhost:5984');

var SlipCover = require('slipcover');
var _ = require('underscore');

var ExampleModel = SlipCover.Model.extend({
  type: 'example',
  
  // You can setup a transformer for get, create, updates. This
  // gives you the ability to transfrom the data without touching
  // the route or model methods. This is a good way to deal with
  // models that need joins. An example would be fetching the Authors
  // for all the blog posts.
  transformers: {
    get: function (record, callback) {
      // do something to transform the data
      record.name = record.first_name + ' ' + record.last_name;
      callback(null, record);
    }
  },
  
  // All create/update requests are validated against this schema
  // See schemajs for more details.
  schema: {
    type: { type: 'string', required: true },
    first_name: { type: 'string', required: true },
    last_name: { type: 'string', require: true }
  }
  
  // By default there is no list method. This is because you will 
  // typically need to setup a view for your list opperation. The
  // route is setup by default in the App so you just need to create
  // your list method for the model.
  list: function (options, callback) {
    this.conn.view('examples', 'getByLastName', options, function (err, data) {
      if (err) {
        return callback(err);
      }
      
      callback(null, data.rows);
    });
  }
  
});

var ExampleApp = SlipCover.App.extend({
  
  // Just like backbone you can setup your own initialize method
  initialize: funciton (options) {
    // You will need to bind the instance of this object to
    // your route methods.
    _.bindAll(this, 'minimal');
  },
  
  // Extend the default routes with your own.
  routes: {
    'GET /example/:id/minimal': 'minimal' 
  },
  
  // The custom route method
  minimal: function (req, res, next) {
    this.model.get(req.params.id, function (err, example) {
      if (err) {
        return next(err);
      }
      
      delete example.first_name;
      delete example.last_name;
      
      res.send(200, example)
    });
  }
  
});

// Setup a connection to the database
var exampleDb = nano.db.use('exampledb');

// When you initlaize your model you will need to pass
// the database connection
var model = new ExampleModel({ conn: exampleDb });

// Pass your model to the app as an options upon initialization
var app = new ExampleApp({ model: model });

// Create your Restify server
var server = restify.createServer();

// Mount your application.
app.mount(server);
```

### License

The MIT License (MIT) Copyright (c) 2012 Plus 3 Network

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
