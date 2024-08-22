"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ball = void 0;
const schema_1 = require("@colyseus/schema");
class Ball extends schema_1.Schema {
}
exports.Ball = Ball;
__decorate([
    (0, schema_1.type)("string")
], Ball.prototype, "uId", void 0);
__decorate([
    (0, schema_1.type)("number")
], Ball.prototype, "posX", void 0);
__decorate([
    (0, schema_1.type)("number")
], Ball.prototype, "posY", void 0);
__decorate([
    (0, schema_1.type)("number")
], Ball.prototype, "angle", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], Ball.prototype, "visible", void 0);
__decorate([
    (0, schema_1.type)("number")
], Ball.prototype, "shadowPosX", void 0);
__decorate([
    (0, schema_1.type)("number")
], Ball.prototype, "shadowPosY", void 0);
__decorate([
    (0, schema_1.type)("number")
], Ball.prototype, "shadowAngle", void 0);
__decorate([
    (0, schema_1.type)("number")
], Ball.prototype, "shadowH", void 0);
__decorate([
    (0, schema_1.type)("number")
], Ball.prototype, "shadowW", void 0);
__decorate([
    (0, schema_1.type)("number")
], Ball.prototype, "shadowOpacity", void 0);
__decorate([
    (0, schema_1.type)("number")
], Ball.prototype, "enableTrace", void 0);
