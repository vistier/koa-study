# Koa 学习

## 技术栈
 * Koa2
 * middlewares
    - koa-router
    - koa-views
    - koa-static
    - koa-bodyparser
 * mongoosen
 * nodemon(自动重启服务) + runkoa（支持async/await，且不需关心babel）
 * pm2 for deployment（服务器部署）

## 第一天
### 创建项目
 * 创建一个空文件夹koa
 * 在koa文件下初始化项目 
    - `npm init` (生成package.json文件)
    - app.js   // 项目入口文件
    - bin/www   // 项目启动文件
    - bin/run   // 项目启动文件
 * 添加项目依赖
    - koa 
    - koa-logger 
    - koa-session
    - koa-bodyparser: 表单数据解析
    - koa-router: 路由控制
    - mongoose
    - sha1: 
    - lodash
    - uuid
    - xss: 防xss攻击 处理
    - bluebird: promise
    - speakeasy: 生成随机数
 