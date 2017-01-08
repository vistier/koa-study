/**
 * Created by Adi(adi@imeth.cn) on 2017/1/8.
 */
"use strict";

var router = require('koa-router')();

router.get('/', ctx => {
	ctx.body = {
		id: new Date().getTime()
	};
});

module.exports = router;