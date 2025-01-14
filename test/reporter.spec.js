const fs = require('fs');
const assert = require('assert');
const pactum = require('pactum');
const { mock, reporter } = pactum;
const { reset } = require('../src/store');

function cleanDir() {
  fs.unlinkSync(process.cwd() + '/.pactum/contracts/flows/flow get.json');
  fs.unlinkSync(process.cwd() + '/.pactum/contracts/interactions/provider1-flow get.json');
  fs.rmdirSync(process.cwd() + '/.pactum/contracts/flows');
  fs.rmdirSync(process.cwd() + '/.pactum/contracts/interactions');
  fs.rmdirSync(process.cwd() + '/.pactum/contracts');
  fs.rmdirSync(process.cwd() + '/.pactum');
}

describe('Publish', () => {

  describe('Reporter - Empty Flows & Interactions', () => {

    before(() => {
      mock.addInteraction('get project');
      mock.addInteraction('create analysis');
      mock.addInteraction('run process');
    });

    it('running a normal spec should not contact with flow server', async () => {
      await pactum.spec()
        .get('/api/get')
        .useInteraction({
          request: {
            method: 'GET',
            path: '/api/get'
          },
          response: {
            status: 200
          }
        })
        .expectStatus(200);
      await reporter.end();
      assert.strictEqual(mock.getInteraction('get project').exercised, false);
      assert.strictEqual(mock.getInteraction('create analysis').exercised, false);
      assert.strictEqual(mock.getInteraction('run process').exercised, false);
    });

    after(() => {
      mock.clearInteractions();
      reset();
    });

  });

  describe('Reporter - One Interaction', () => {

    before(() => {
      mock.addInteraction('get project');
      mock.addInteraction('create analysis');
      mock.addInteraction('add interaction');
      mock.addInteraction('run process');
    });

    it('running a normal spec with valid interaction should contact with flow server', async () => {
      await pactum.spec()
        .get('/api/get')
        .useInteraction({
          provider: 'provider1',
          flow: 'flow1',
          request: {
            method: 'GET',
            path: '/api/get'
          },
          response: {
            status: 200
          }
        })
        .expectStatus(200);
      await reporter.end();
      assert.strictEqual(mock.getInteraction('get project').exercised, true);
      assert.strictEqual(mock.getInteraction('create analysis').exercised, true);
      assert.strictEqual(mock.getInteraction('add interaction').exercised, true);
      assert.strictEqual(mock.getInteraction('run process').exercised, true);
    });

    after(() => {
      mock.clearInteractions();
      reset();
    });

  });

  describe('Reporter - One Flow', () => {

    before(() => {
      mock.addInteraction('get project');
      mock.addInteraction('create analysis');
      mock.addInteraction('add flow');
      mock.addInteraction('run process');
    });

    it('running a valid flow should contact with flow server', async () => {
      await pactum.flow('flow get')
        .get('/api/get')
        .useInteraction({
          request: {
            method: 'GET',
            path: '/api/get'
          },
          response: {
            status: 200
          }
        })
        .expectStatus(200);
      await reporter.end();
      assert.strictEqual(mock.getInteraction('get project').exercised, true);
      assert.strictEqual(mock.getInteraction('create analysis').exercised, true);
      assert.strictEqual(mock.getInteraction('add flow').exercised, true);
      assert.strictEqual(mock.getInteraction('run process').exercised, true);
    });

    after(() => {
      mock.clearInteractions();
      reset();
    });

  });

  describe('Reporter - One Flow & One Interaction', () => {

    before(() => {
      mock.addInteraction('get project');
      mock.addInteraction('create analysis');
      mock.addInteraction('add interaction with flow');
      mock.addInteraction('add flow with interaction');
      mock.addInteraction('run process');
    });

    it('running a valid flow should contact with flow server', async () => {
      await pactum.flow('flow get')
        .get('/api/get')
        .useInteraction({
          provider: 'provider1',
          flow: 'flow get',
          request: {
            method: 'GET',
            path: '/api/get'
          },
          response: {
            status: 200
          }
        })
        .expectStatus(200);
      await reporter.end();
      assert.strictEqual(mock.getInteraction('get project').exercised, true);
      assert.strictEqual(mock.getInteraction('create analysis').exercised, true);
      assert.strictEqual(mock.getInteraction('add interaction with flow').exercised, true);
      assert.strictEqual(mock.getInteraction('add flow with interaction').exercised, true);
      assert.strictEqual(mock.getInteraction('run process').exercised, true);
    });

    after(() => {
      mock.clearInteractions();
      reset();
    });

  });

});

describe('Disable Publish', () => {

  before(() => {
    const pfr = require('../src/index');
    pfr.config.publish = false;
  });

  describe('Reporter - One Flow & One Interaction', () => {

    before(() => {
      mock.addInteraction('get project');
    });

    it('running a valid flow should contact with flow server', async () => {
      await pactum.flow('flow get')
        .get('/api/get')
        .useInteraction({
          provider: 'provider1',
          flow: 'flow get',
          request: {
            method: 'GET',
            path: '/api/get'
          },
          response: {
            status: 200
          }
        })
        .expectStatus(200);
      await reporter.end();
      assert.strictEqual(mock.getInteraction('get project').exercised, false);
    });

    after(() => {
      mock.clearInteractions();
      reset();
    });

  });

  after(() => {
    const pfr = require('../src/index');
    pfr.config.publish = true;
  });

});

describe('Disable Publish - Save in FS', () => {

  before(() => {
    const pfr = require('../src/index');
    pfr.config.publish = false;
    pfr.config.dir = true;
  });

  describe('Reporter - One Flow & One Interaction', () => {

    before(() => {
      mock.addInteraction('get project');
    });

    it('running a valid flow should contact with flow server', async () => {
      await pactum.flow('flow get')
        .get('/api/get')
        .useInteraction({
          provider: 'provider1',
          flow: 'flow get',
          request: {
            method: 'GET',
            path: '/api/get'
          },
          response: {
            status: 200
          }
        })
        .expectStatus(200);
      await reporter.end();
      assert.strictEqual(mock.getInteraction('get project').exercised, false);
    });

    after(() => {
      mock.clearInteractions();
      reset();
    });

  });

  after(() => {
    const pfr = require('../src/index');
    pfr.config.publish = true;
    pfr.config.dir = false;
    cleanDir();
  });

});

describe('Publish - Save in FS', () => {

  before(() => {
    mock.addInteraction('get project');
    mock.addInteraction('create analysis');
    mock.addInteraction('add interaction with flow');
    mock.addInteraction('add flow with interaction');
    mock.addInteraction('run process');
    const pfr = require('../src/index');
    pfr.config.dir = true;
  });

  it('running a valid flow should contact with flow server', async () => {
    await pactum.flow('flow get')
      .get('/api/get')
      .useInteraction({
        provider: 'provider1',
        flow: 'flow get',
        request: {
          method: 'GET',
          path: '/api/get'
        },
        response: {
          status: 200
        }
      })
      .expectStatus(200);
    await reporter.end();
    assert.strictEqual(mock.getInteraction('get project').exercised, true);
    assert.strictEqual(mock.getInteraction('create analysis').exercised, true);
    assert.strictEqual(mock.getInteraction('add interaction with flow').exercised, true);
    assert.strictEqual(mock.getInteraction('add flow with interaction').exercised, true);
    assert.strictEqual(mock.getInteraction('run process').exercised, true);
  });

  after(() => {
    mock.clearInteractions();
    reset();
    const pfr = require('../src/index');
    pfr.config.dir = false;
    cleanDir();
  });

});