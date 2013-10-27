A hapi plugin that runs each request within a continuation-local storage context.

Example:

```js
var cls = require('continuation-local-storage');
var ns = cls.createNamespace('hapi@test');
ns.set('value', 42);

var Server = require('hapi').Server;
server = new Server('localhost', 8080);

server.pack.require('hapi-cls', {namespace : ns.name}, function (err) {
  if (err) done(err);
});

var hello = {
  handler : function (request) {
    ns.set('value', 'overwritten');
    setTimeout(function () {
      request.reply({value : ns.get('value')});
    });
  }
};

server.addRoute({
  method : 'GET',
  path : '/hello',
  config : hello
});

server.listen();
```

With this setup, requests to `/hello` will return `{"value":"overwritten"}`. As
with regular CLS, values that are set in route handlers will be accessible to
callbacks passed to asynchronous functions.

The namespace used (or, optionally, created) by the plugin will be available in
route handlers via the application state variable `clsNamespace`.
