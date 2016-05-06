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

    it('responds to /register', function testSlash(done) {
        request(server)
            .get('/register')
            .expect(200, done);
    });

    it('valid login to post /register', function testSlash(done) {
        var randomName = 'test' + Math.random();
        request(server)
            .post('/register')
            .send({email: randomName, password: randomName})
            .expect(200, done);
    });

});