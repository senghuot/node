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

    it('responds to /search', function testSlash(done) {
        request(server)
            .get('/search')
            .expect(404, done);
    });

    it('invalid login to post /search', function testSlash(done) {
        request(server)
            .post('/search')
            .send({keyword: "googleplex"})
            .expect(400, done);
    });

    it('valid login to post /search', function testSlash(done) {
        request(server)
            .post('/search')
            .send({keyword: "space needle"})
            .expect(200, done);
    });

});