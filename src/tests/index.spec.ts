const supertest = require('supertest');
const assert = require('assert');
const app = require('../index');

describe('GET /api/healthcheck', function () {
  it('it should has status code 200', function (done) {
    supertest(app)
      .get('/api/healthcheck')
      .expect(200)
      .end(function (err: Error, res: Response) {
        if (err) done(err);
        done();
      });
  });
});
