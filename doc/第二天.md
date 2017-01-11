# 第二天 KOA API

```
var koa = require('koa');
var app = koa();

// x-response-time
app.use(function *(next){
  // (1) 进入路由
  var start = new Date;
  yield next;
  // (5) 再次进入 x-response-time 中间件，记录2次通过此中间件「穿越」的时间
  var ms = new Date - start;
  this.set('X-Response-Time', ms + 'ms');
  // (6) 返回 this.body
});

// logger
app.use(function *(next){
  // (2) 进入 logger 中间件
  var start = new Date;
  yield next;
  // (4) 再次进入 logger 中间件，记录2次通过此中间件「穿越」的时间
  var ms = new Date - start;
  console.log('%s %s - %s', this.method, this.url, ms);
});

// response
app.use(function *(){
  // (3) 进入 response 中间件，没有捕获到下一个符合条件的中间件，传递到 upstream
  this.body = 'Hello World';
});

app.listen(3000);
```

app.use 将给定的 function 当做中间件加载到应用中

## middleware
 * KOA的中间件是一个栈式的模型
 ```
 .middleware1 {
   // (1) do some stuff
   .middleware2 {
     // (2) do some other stuff
     .middleware3 {
       // (3) NO next yield !
       // this.body = 'hello world'
     }
     // (4) do some other stuff later
   }
   // (5) do some stuff lastest and return
 }
 ```
 
### 官方推荐的中间件
 * [koa-router](https://github.com/alexmingoia/koa-router) 路由控制
 * trie-router
 * route 
 * basic-auth 简单的认证管理
 * [koa-etag](https://github.com/koajs/etag) 使用Http的Etag功能(版本控制)
 * compose
 * [koa-static](https://github.com/koajs/static)   静态资源管理
 * [koa-static-cache](https://github.com/koajs/static-cache) 静态资源缓存管理
 * [koa-session](https://github.com/koajs/session) 服务器会话状态管理
 * compress 
 * [koa-csrf](https://github.com/koajs/csrf) 跨站请求伪造
 * [koa-logger](https://github.com/koajs/logger) http请求日志
 * [koa-mount](https://github.com/koajs/mount)  实例挂载管理
 * [koa-send](https://github.com/koajs/send)
 * [koa-error](https://github.com/koajs/error) 异常页面统一处理

### 中间件性能
挂载不同数量的中间件，wrk 得出 benchmarks 如下：
```
1 middleware
8367.03

5 middleware
8074.10

10 middleware
7526.55

15 middleware
7399.92

20 middleware
7055.33

30 middleware
6460.17

50 middleware
5671.98

100 middleware
4349.37
```
一般来说，我们通常要使用约50个中间件，按这个标准计算，单应用可支持 340,260 请求/分钟，即 20,415,600 请求/小时，也就是约 4.4 亿 请求/天。
 
 
## Settings 
 ```koa实例的属性```
 * app.name 应用名称
 * app.env 执行环境，默认是 NODE_ENV 或者 "development" 字符串
 * app.proxy 决定了哪些 proxy header 参数会被加到信任列表中
 * app.subdomainOffset 被忽略的 .subdomains 列表，详见下方 api
 
## 常用API
 
### 上下文(ctx)
```
app.use(function *(){
  this; // 上下文对象
  this.request; // Request 对象
  this.response; // Response 对象
});
```
 * 请求访问上下文
 * ctx中代理了request, response的角色
 * 可单独获取出request(ctx.request), response(ctx.request) Node原生对象

### API
| 属性 | 是否可读写 | 说明 |
| --- | --- | --- |
| ctx.app                   |   | app 实例 |
| ctx.state                 |   | 推荐的命名空间，用来保存那些通过中间件传递给视图的参数或数据。比如 this.state.user = yield User.find(id); |
| ctx.cookies.get()         |   | 获取cookies(key, {signed:boolean})|
| ctx.cookies.set()         |   | 设置cookies(key, value, {signed:boolean, expires:date, path:string, domain:string, secure:boolean, httpOnly:boolean} ) |
| ctx.throw()               |   | 抛出异常, 抛出http状态 (msg, [status=500])|
| ctx.res.writeHead()       |   |
| ctx.res.write()           |
| ctx.res.end()             |
 
#### Request
| 属性 | 是否可读写 | 说明 |
| --- | --- | --- |
| header                | 只读 | 请求头 |
| method                | 读写 | 请求方法 | 
| length                | 只读 | 返回 req 对象的 Content-Length (Number) |
| url                   | 读写 | 请求url |
| path                  | 读写 | 返回请求 pathname(uri) | 
| querystring           | 读写 | 返回 url 中的查询字符串，去除了头部的 '?' |
| query                 | 读写 | 返回 url 中的查询字符串，返回出来的是object |
| search                | 只读 | 返回 url 中的查询字符串，包含了头部的 '?' |
| host                  | 只读 | 返回请求主机名，不包含端口；当 app.proxy 设置为 true 时，支持 X-Forwarded-Host |
| type                  | 只读 | 返回 req 对象的 Content-Type，不包括 charset 属性, 如: 'image/png' |
| fresh                 | 只读 | 检查客户端请求的缓存是否是最新。当缓存为最新时，可编写业务逻辑直接返回 304 |
| stale                 | 只读 | 与 req.fresh 返回的结果正好相反 |
| socket                | 只读 |
| protocol              | 只读 | 返回请求协议名，如 "https" 或者 "http"；当 app.proxy 设置为 true 时，支持 X-Forwarded-Proto |
| secure                | 只读 | 判断请求协议是否为 HTTPS 的快捷方法，等同于 this.protocol == "https" |
| ip                    | 只读 | 返回请求IP；当 app.proxy 设置为 true 时，支持 X-Forwarded-For |
| ips                   | 只读 | 返回请求IP列表，仅当 app.proxy 设置为 true ，并存在 X-Forwarded-For 列表时，否则返回空数组。|
| subdomains            | 只读 | 返回请求对象中的子域名数组。子域名数组会自动由请求域名字符串中的 . 分割开，在没有设置自定义的 app.subdomainOffset 参数时，默认返回根域名之前的所有子域名数组. <br/> 例如，当请求域名为 "tobi.ferrets.example.com" 时候，返回 ["ferrets", "tobi"]，数组顺序是子代域名在前，孙代域名在后。 | 
| is(type)              | 只读 | 判断请求对象中 Content-Type 是否为给定 type 的快捷方法，如果不存在 request.body，将返回 undefined，如果没有符合的类型，返回 false，除此之外，返回匹配的类型字符串。 |
| accepts(type)         |      | 判断请求对象中 Accept 是否为给定 type 的快捷方法，当匹配到符合的类型时，返回最匹配的类型，否则返回 false（此时服务器端应当返回 406 "Not Acceptable" ），传入参数可以是字符串或者数组。|
| acceptsEncodings(encodings)|| 判断客户端是否接受给定的编码方式的快捷方法，当有传入参数时，返回最应当返回的一种编码方式。 |
| acceptsCharsets()     | 只读 |
| acceptsLanguages()    | 只读 |
| get()                 | 只读 |

#### Response
| 属性 | 是否可读写 | 说明 |
| --- | --- | --- |
| body              | 读写 | 注意: 当 res.body 为 null ，但返回状态仍为 200 时，koa 将会返回 404 页面。 |
| header            | 读写 |
| status            | 读写 |
| length            | 读   |
| type              | 读写 | 使用字符串或者文件后缀设定返回的 Content-Type <br> 注意：当使用文件后缀指定时，koa 会默认设置好最匹配的编码字符集，比如当设定 res.type = 'html' 时，koa 会默认使用 "utf-8" 字符集。但当明确使用 res.type = 'text/html' 指定时，koa 不会自动设定字符集|
| headerSent        | 读  |
| redirect()        |     | 返回一个 302 跳转到给定的 url，您也可以使用关键词 back 来跳转到该 url 的上一个页面（refer），当没有上一个页面时，默认会跳转到 '/' |
| attachment()      |     | 设置返回熟悉 Content-Disposition 为 "attachment"，并告知客户端进行下载。 |
| set()             |     | 使用给定的参数设置一个返回头属性： |
| get()             |     | 获取指定的返回头属性，属性名称区分大小写。 |
| remove()          |     | 删除指定的返回头属性 |
| lastModified()    | 写  |
| lastModified()    | 写  |

 
 
 
## http 响应状态码
 * 100 "continue"
 * 101 "switching protocols"
 * 102 "processing"
 * 200 "ok"
 * 201 "created"
 * 202 "accepted"
 * 203 "non-authoritative information"
 * 204 "no content"
 * 205 "reset content"
 * 206 "partial content"
 * 207 "multi-status"
 * 300 "multiple choices"
 * 301 "moved permanently"
 * 302 "moved temporarily"
 * 303 "see other"
 * 304 "not modified"
 * 305 "use proxy"
 * 307 "temporary redirect"
 * 400 "bad request"
 * 401 "unauthorized"
 * 402 "payment required"
 * 403 "forbidden"
 * 404 "not found"
 * 405 "method not allowed"
 * 406 "not acceptable"
 * 407 "proxy authentication required"
 * 408 "request time-out"
 * 409 "conflict"
 * 410 "gone"
 * 411 "length required"
 * 412 "precondition failed"
 * 413 "request entity too large"
 * 414 "request-uri too large"
 * 415 "unsupported media type"
 * 416 "requested range not satisfiable"
 * 417 "expectation failed"
 * 418 "i'm a teapot"
 * 422 "unprocessable entity"
 * 423 "locked"
 * 424 "failed dependency"
 * 425 "unordered collection"
 * 426 "upgrade required"
 * 428 "precondition required"
 * 429 "too many requests"
 * 431 "request header fields too large"
 * 500 "internal server error"
 * 501 "not implemented"
 * 502 "bad gateway"
 * 503 "service unavailable"
 * 504 "gateway time-out"
 * 505 "http version not supported"
 * 506 "variant also negotiates"
 * 507 "insufficient storage"
 * 509 "bandwidth limit exceeded"
 * 510 "not extended"
 * 511 "network authentication required" 
 
 
 
 
 
 
 