const Koa = require("koa");
const app = new Koa();

app.use(async (ctx: any, next: any) => {
    await next();
    ctx.response.type = "text/html";
    ctx.response.body = "<h1>Hello Koa2!</h1>";
});

app.listen(3000);
console.log("app started at port 3000...");