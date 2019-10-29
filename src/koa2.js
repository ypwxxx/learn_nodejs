"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const Koa = require("koa");
const app = new Koa();
app.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield next();
    ctx.response.type = "text/html";
    ctx.response.body = "<h1>Hello Koa2!</h1>";
}));
app.listen(3000);
console.log("app started at port 3000...");
//# sourceMappingURL=koa2.js.map