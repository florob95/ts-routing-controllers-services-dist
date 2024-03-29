"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ActionMetadata_1 = require("../../metadata/ActionMetadata");
var BaseDriver_1 = require("../BaseDriver");
var AuthorizationCheckerNotDefinedError_1 = require("../../error/AuthorizationCheckerNotDefinedError");
var AccessDeniedError_1 = require("../../error/AccessDeniedError");
var isPromiseLike_1 = require("../../util/isPromiseLike");
var container_1 = require("../../container");
var AuthorizationRequiredError_1 = require("../../error/AuthorizationRequiredError");
var index_1 = require("../../index");
var cookie = require("cookie");
var templateUrl = require("template-url");
/**
 * Integration with koa framework.
 */
var KoaDriver = /** @class */ (function (_super) {
    __extends(KoaDriver, _super);
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function KoaDriver(koa, router) {
        var _this = _super.call(this) || this;
        _this.koa = koa;
        _this.router = router;
        _this.loadKoa();
        _this.loadRouter();
        _this.app = _this.koa;
        return _this;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Initializes the things driver needs before routes and middleware registration.
     */
    KoaDriver.prototype.initialize = function () {
        var bodyParser = require("koa-bodyparser");
        this.koa.use(bodyParser());
        if (this.cors) {
            var cors = require("kcors");
            if (this.cors === true) {
                this.koa.use(cors());
            }
            else {
                this.koa.use(cors(this.cors));
            }
        }
    };
    /**
     * Registers middleware that run before controller actions.
     */
    KoaDriver.prototype.registerMiddleware = function (middleware) {
        if (middleware.instance.use) {
            this.koa.use(function (ctx, next) {
                return middleware.instance.use(ctx, next);
            });
        }
    };
    /**
     * Registers action in the driver.
     */
    KoaDriver.prototype.registerAction = function (actionMetadata, executeCallback) {
        var _a;
        var _this = this;
        // middlewares required for this action
        var defaultMiddlewares = [];
        if (actionMetadata.isAuthorizedUsed) {
            defaultMiddlewares.push(function (context, next) {
                if (!_this.authorizationChecker)
                    throw new AuthorizationCheckerNotDefinedError_1.AuthorizationCheckerNotDefinedError();
                var action = { request: context.request, response: context.response, context: context, next: next };
                try {
                    var checkResult = actionMetadata.authorizedRoles instanceof Function ?
                        container_1.getFromContainer(actionMetadata.authorizedRoles).check(action) :
                        _this.authorizationChecker(action, actionMetadata.authorizedRoles);
                    var handleError_1 = function (result) {
                        if (!result) {
                            var error = actionMetadata.authorizedRoles.length === 0 ? new AuthorizationRequiredError_1.AuthorizationRequiredError(action) : new AccessDeniedError_1.AccessDeniedError(action);
                            return _this.handleError(error, actionMetadata, action);
                        }
                        else {
                            return next();
                        }
                    };
                    if (isPromiseLike_1.isPromiseLike(checkResult)) {
                        return checkResult
                            .then(function (result) { return handleError_1(result); })
                            .catch(function (error) { return _this.handleError(error, actionMetadata, action); });
                    }
                    else {
                        return handleError_1(checkResult);
                    }
                }
                catch (error) {
                    return _this.handleError(error, actionMetadata, action);
                }
            });
        }
        if (actionMetadata.isFileUsed || actionMetadata.isFilesUsed) {
            var multer_1 = this.loadMulter();
            actionMetadata.params
                .filter(function (param) { return param.type === "file"; })
                .forEach(function (param) {
                defaultMiddlewares.push(multer_1(param.extraOptions).single(param.name));
            });
            actionMetadata.params
                .filter(function (param) { return param.type === "files"; })
                .forEach(function (param) {
                defaultMiddlewares.push(multer_1(param.extraOptions).array(param.name));
            });
            defaultMiddlewares.push(this.fixMulterRequestAssignment);
        }
        // user used middlewares
        var uses = actionMetadata.controllerMetadata.uses.concat(actionMetadata.uses);
        var beforeMiddlewares = this.prepareMiddlewares(uses.filter(function (use) { return !use.afterAction; }));
        var afterMiddlewares = this.prepareMiddlewares(uses.filter(function (use) { return use.afterAction; }));
        // prepare route and route handler function
        var route = ActionMetadata_1.ActionMetadata.appendBaseRoute(this.routePrefix, actionMetadata.fullRoute);
        var routeHandler = function (context, next) {
            var options = { request: context.request, response: context.response, context: context, next: next };
            return executeCallback(options);
        };
        // finally register action in koa
        (_a = this.router)[actionMetadata.type.toLowerCase()].apply(_a, __spreadArrays([
            route
        ], beforeMiddlewares, defaultMiddlewares, [
            routeHandler
        ], afterMiddlewares));
    };
    /**
     * Registers all routes in the framework.
     */
    KoaDriver.prototype.registerRoutes = function () {
        this.koa.use(this.router.routes());
        this.koa.use(this.router.allowedMethods());
    };
    /**
     * Gets param from the request.
     */
    KoaDriver.prototype.getParamFromRequest = function (actionOptions, param) {
        var context = actionOptions.context;
        var request = actionOptions.request;
        switch (param.type) {
            case "body":
                return request.body;
            case "body-param":
                return request.body[param.name];
            case "param":
                return context.params[param.name];
            case "params":
                return context.params;
            case "session":
                return context.session;
            case "session-param":
                return context.session[param.name];
            case "state":
                if (param.name)
                    return context.state[param.name];
                return context.state;
            case "query":
                return context.query[param.name];
            case "queries":
                return context.query;
            case "file":
                return actionOptions.context.req.file;
            case "files":
                return actionOptions.context.req.files;
            case "header":
                return context.headers[param.name.toLowerCase()];
            case "headers":
                return request.headers;
            case "cookie":
                if (!context.headers.cookie)
                    return;
                var cookies = cookie.parse(context.headers.cookie);
                return cookies[param.name];
            case "cookies":
                if (!request.headers.cookie)
                    return {};
                return cookie.parse(request.headers.cookie);
        }
    };
    /**
     * Handles result of successfully executed controller action.
     */
    KoaDriver.prototype.handleSuccess = function (result, action, options) {
        // if the action returned the context or the response object itself, short-circuits
        if (result && (result === options.response || result === options.context)) {
            return options.next();
        }
        // transform result if needed
        result = this.transformResult(result, action, options);
        if (action.redirect) { // if redirect is set then do it
            if (typeof result === "string") {
                options.response.redirect(result);
            }
            else if (result instanceof Object) {
                options.response.redirect(templateUrl(action.redirect, result));
            }
            else {
                options.response.redirect(action.redirect);
            }
        }
        else if (action.renderedTemplate) { // if template is set then render it // TODO: not working in koa
            var renderOptions_1 = result && result instanceof Object ? result : {};
            this.koa.use(function (ctx, next) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ctx.render(action.renderedTemplate, renderOptions_1)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                });
            });
        }
        else if (result === undefined) { // throw NotFoundError on undefined response
            if (action.undefinedResultCode instanceof Function) {
                throw new action.undefinedResultCode(options);
            }
            else if (!action.undefinedResultCode) {
                throw new index_1.NotFoundError();
            }
        }
        else if (result === null) { // send null response
            if (action.nullResultCode instanceof Function)
                throw new action.nullResultCode(options);
            options.response.body = null;
        }
        else if (result instanceof Uint8Array) { // check if it's binary data (typed array)
            options.response.body = Buffer.from(result);
        }
        else { // send regular result
            if (result instanceof Object) {
                options.response.body = result;
            }
            else {
                options.response.body = result;
            }
        }
        // set http status code
        if (result === undefined && action.undefinedResultCode) {
            options.response.status = action.undefinedResultCode;
        }
        else if (result === null && action.nullResultCode) {
            options.response.status = action.nullResultCode;
        }
        else if (action.successHttpCode) {
            options.response.status = action.successHttpCode;
        }
        else if (options.response.body === null) {
            options.response.status = 204;
        }
        // apply http headers
        Object.keys(action.headers).forEach(function (name) {
            options.response.set(name, action.headers[name]);
        });
        return options.next();
    };
    /**
     * Handles result of failed executed controller action.
     */
    KoaDriver.prototype.handleError = function (error, action, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.isDefaultErrorHandlingEnabled) {
                // apply http headers
                if (action) {
                    Object.keys(action.headers).forEach(function (name) {
                        options.response.set(name, action.headers[name]);
                    });
                }
                // send error content
                if (action && action.isJsonTyped) {
                    options.response.body = _this.processJsonError(error);
                }
                else {
                    options.response.body = _this.processTextError(error);
                }
                // set http status
                if (error instanceof index_1.HttpError && error.httpCode) {
                    options.response.status = error.httpCode;
                }
                else {
                    options.response.status = 500;
                }
                return resolve();
            }
            return reject(error);
        });
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Creates middlewares from the given "use"-s.
     */
    KoaDriver.prototype.prepareMiddlewares = function (uses) {
        var _this = this;
        var middlewareFunctions = [];
        uses.forEach(function (use) {
            if (use.middleware.prototype && use.middleware.prototype.use) { // if this is function instance of MiddlewareInterface
                middlewareFunctions.push(function (context, next) {
                    try {
                        var useResult = container_1.getFromContainer(use.middleware).use(context, next);
                        if (isPromiseLike_1.isPromiseLike(useResult)) {
                            useResult.catch(function (error) {
                                _this.handleError(error, undefined, {
                                    request: context.req,
                                    response: context.res,
                                    context: context,
                                    next: next
                                });
                                return error;
                            });
                        }
                        return useResult;
                    }
                    catch (error) {
                        _this.handleError(error, undefined, {
                            request: context.request,
                            response: context.response,
                            context: context,
                            next: next
                        });
                    }
                });
            }
            else {
                middlewareFunctions.push(use.middleware);
            }
        });
        return middlewareFunctions;
    };
    /**
     * Dynamically loads koa and required koa-router module.
     */
    KoaDriver.prototype.loadKoa = function () {
        if (require) {
            if (!this.koa) {
                try {
                    this.koa = new (require("koa"))();
                }
                catch (e) {
                    throw new Error("koa package was not found installed. Try to install it: npm install koa@next --save");
                }
            }
        }
        else {
            throw new Error("Cannot load koa. Try to install all required dependencies.");
        }
    };
    /**
     * Dynamically loads koa-router module.
     */
    KoaDriver.prototype.loadRouter = function () {
        if (require) {
            if (!this.router) {
                try {
                    this.router = new (require("koa-router"))();
                }
                catch (e) {
                    throw new Error("koa-router package was not found installed. Try to install it: npm install koa-router@next --save");
                }
            }
        }
        else {
            throw new Error("Cannot load koa. Try to install all required dependencies.");
        }
    };
    /**
     * Dynamically loads koa-multer module.
     */
    KoaDriver.prototype.loadMulter = function () {
        try {
            return require("koa-multer");
        }
        catch (e) {
            throw new Error("koa-multer package was not found installed. Try to install it: npm install koa-multer --save");
        }
    };
    /**
     * This middleware fixes a bug on koa-multer implementation.
     *
     * This bug should be fixed by koa-multer PR #15: https://github.com/koa-modules/multer/pull/15
     */
    KoaDriver.prototype.fixMulterRequestAssignment = function (ctx, next) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if ("request" in ctx) {
                            if (ctx.req.body)
                                ctx.request.body = ctx.req.body;
                            if (ctx.req.file)
                                ctx.request.file = ctx.req.file;
                            if (ctx.req.files) {
                                ctx.request.files = ctx.req.files;
                                ctx.files = ctx.req.files;
                            }
                        }
                        return [4 /*yield*/, next()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return KoaDriver;
}(BaseDriver_1.BaseDriver));
exports.KoaDriver = KoaDriver;
//# sourceMappingURL=KoaDriver.js.map