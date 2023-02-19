"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const typeorm_1 = require("typeorm");
const channel_entity_1 = require("../../channel/entity/channel.entity");
let User = class User {
    constructor(login) {
        this.login = login;
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 8 }),
    __metadata("design:type", String)
], User.prototype, "login", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { array: true, default: [] }),
    __metadata("design:type", Array)
], User.prototype, "friendsList", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { array: true, default: [] }),
    __metadata("design:type", Array)
], User.prototype, "pendingFriendRequests", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { array: true, default: [] }),
    __metadata("design:type", Array)
], User.prototype, "blockedList", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp', { default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], User.prototype, "firstLogin", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(type => channel_entity_1.Channel, channel => channel.users),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], User.prototype, "channels", void 0);
User = __decorate([
    (0, typeorm_1.Entity)({ name: "users" }),
    __metadata("design:paramtypes", [String])
], User);
exports.User = User;
//# sourceMappingURL=user.entity.js.map