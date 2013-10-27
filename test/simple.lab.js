var lab      = require('lab');
var describe = lab.experiment;
var it       = lab.test;
var before   = lab.before;
var expect   = lab.expect;

describe("basic hapi CLS case", function () {
  var server;

  before(function (done) {
    var cls = require('continuation-local-storage');
    var ns = cls.createNamespace('hapi@test');
    ns.set('value', 42);

    var Server = require('hapi').Server;
    server = new Server('localhost', 8080);

    server.pack.require('..', {namespace : ns.name}, function (err) {
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

    done();
  });

  it("should still find CLS context on subsequent ticks", function (done) {
    expect(process.namespaces['hapi@test']).to.be.ok;
    server.inject({url : '/hello'}, function (res) {
      expect(res.payload).equal('{"value":"overwritten"}');
      done();
    });
  });
});
