'use strict';

import { Done } from 'mocha';

const path = require('path');
const express = require('express');
const expect = require('expect.js');
const request = require('supertest');
const nunjucks = require('../nunjucks');

const VIEWS = path.join(__dirname, '../samples/express/views');


describe('express', () => {
  let app;
  let env;


  beforeEach(() => {
    app = express();
    env = new nunjucks.Environment(new nunjucks.FileSystemLoader(VIEWS));
    env.express(app);
  });


  it('should have reference to nunjucks env', () => {
    expect(app.settings.nunjucksEnv).to.be(env);
  });


  it('should render a view with extension', (done: Done) => {
    app.get('/', function(req, res) {
      res.render('about.html');
    });
    request(app)
      .get('/')
      .expect(/This is just the about page/)
      .end(done);
  });


  it('should render a view without extension', (done: Done) => {
    app.get('/', function(req, res) {
      res.render('about');
    });
    app.set('view engine', 'html');
    request(app)
      .get('/')
      .expect(/This is just the about page/)
      .end(done);
  });
});
