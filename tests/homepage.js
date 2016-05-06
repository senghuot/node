var request = require('supertest');
var should = require('should');

describe('loading express', function () {
    var server;

    beforeEach(function () {
        server = require('../app');
    });

    afterEach(function () {
        server.close();
    });

    it('responds to /', function testSlash(done) {
        request(server)
            .get('/')
            .end(function(err, res) {
                res.status.should.equal(200);
                res.info.should.equal(false);
                done()
            });
    });

    it('no respond to /home', function testSlash(done) {
        request(server)
            .get('/home')
            .expect(404, done);
    });
});