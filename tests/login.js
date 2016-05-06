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

    it('responds to /login', function testSlash(done) {
        request(server)
            .get('/login')
            .expect(200, done);
    });

    it('valid login to post /login', function testSlash(done) {
        request(server)
            .post('/login')
            .send({email: 'test', password: 'test'})
            .expect(200, done);
    });

    it('invalid login to post /login', function testSlash(done) {
        request(server)
            .post('/login')
            .send({email: 'invalid', password: 'invalid'})
            .expect(400, done);
    });
});