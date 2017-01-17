/**
 * Created by Adi(adi@imeth.cn) on 2017/1/8.
 */
"use strict";

const Koa = require('koa');
const app = new Koa();
const router = require('koa-router')();
const co = require('co');
const convert = require('koa-convert');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser')();
const logger = require('koa-logger');

// session
var session = require('koa-session');
app.use(convert(session(app)));

// middlewares
app.use(convert(bodyparser));
app.use(convert(json()));
app.use(convert(logger()));
app.use(convert(require('koa-static')(__dirname + '/assets')));

app.use((ctx, next) => {
	console.log("中间件1 前");
	next();
	console.log("中间件1 后");
});

app.use((ctx, next) => {
	console.log("中间件2 前");
	next();
	console.log("中间件2 后");
});

// Route
const index = require('./routes/index');

router.use('/api', index.routes(), index.allowedMethods());

app.use(router.routes(), router.allowedMethods());

// 监听异常
app.on('error', (err, ctx) => {
	console.log('error', ctx.url, err);
});

module.exports = app;