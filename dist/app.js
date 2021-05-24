"use strict";
if (typeof HTMLElement.prototype["removeAllChildren"] !== 'function')
    HTMLElement.prototype["removeAllChildren"] = function () { while (this.lastChild)
        this.removeChild(this.lastChild); };
if (!Array.prototype.find) {
    Array.prototype.find = function (predicate) {
        if (this === null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;
        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };
}
if (!Array.prototype["findLast"]) {
    Array.prototype["findLast"] = function (predicate) {
        if (this === null) {
            throw new TypeError('Array.prototype.findLast called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;
        for (var i = length - 1; i >= 0; i--) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };
}
if (!Array.prototype.findIndex) {
    Array.prototype.findIndex = function (predicate) {
        if (this === null) {
            throw new TypeError('Array.prototype.findIndex called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;
        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return i;
            }
        }
        return -1;
    };
}
if (!Array.prototype["pushShift"]) {
    Array.prototype["pushShift"] = function (value, maxLength) {
        if (this == null)
            throw new TypeError('Array.prototype.pushShift called on null or undefined');
        if (typeof maxLength !== 'number' || maxLength < 0)
            throw new TypeError('maxCount must be a non-negative number');
        var list = Object(this);
        list.push(value);
        if (list.length > maxLength)
            return list.shift();
    };
}
if (!Array.prototype["removeAll"]) {
    Array.prototype["removeAll"] = function (predicate) {
        if (this === null) {
            throw new TypeError('Array.prototype.removeAll called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;
        for (var i = length - 1; i >= 0; i--) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list))
                this.splice(i, 1);
        }
        return length - list.length;
    };
}
if (!Array.prototype["last"]) {
    Array.prototype["last"] = function () {
        var list = Object(this);
        return list[list.length - 1];
    };
}
if (typeof String.prototype.endsWith !== 'function')
    String.prototype.endsWith = function (suffix) { return this.substr(-suffix.length) === suffix; };
if (typeof String.prototype.startsWith !== 'function')
    String.prototype.startsWith = function (prefix) { return this.lastIndexOf(prefix, 0) === 0; };
if (typeof String.prototype["contains"] !== 'function')
    String.prototype["contains"] = function (substring) { return this.indexOf(substring) != -1; };
if (typeof String.prototype["padLeft"] !== 'function')
    String.prototype["padLeft"] = function (totalChars, paddingChar) {
        let s = this;
        while (s.length < (totalChars || 2))
            s = (paddingChar || " ") + s;
        return s;
    };
if (typeof Number.prototype["padLeft"] !== 'function')
    Number.prototype["padLeft"] = function (totalDigits, paddingChar) {
        var s = String(this);
        while (s.length < (totalDigits || 2))
            s = (paddingChar || "0") + s;
        return s;
    };
var A;
(function (A) {
    class BitArray {
        constructor(bytes, length) {
            this.bytes = bytes;
            this.length = length;
        }
        getBit(index) {
            return this.bytes[Math.floor(index / 8)] & (1 << (index % 8));
        }
    }
    A.BitArray = BitArray;
    class DataViewReader {
        constructor(dv, stringTable, offset = 0) {
            this.dv = dv;
            this.stringTable = stringTable;
            this.offset = offset;
        }
        inc(length) {
            let ret = this.offset;
            this.offset += length;
            return ret;
        }
        readBoolean() {
            return !!this.dv.getUint8(this.offset++);
        }
        readByte() {
            return this.dv.getUint8(this.offset++);
        }
        readInt8() {
            return this.dv.getInt8(this.offset++);
        }
        readInt16() {
            return this.dv.getInt16(this.inc(2), true);
        }
        readUint16() {
            return this.dv.getUint16(this.inc(2), true);
        }
        readUint() {
            return this.dv.getUint32(this.inc(4), true);
        }
        readSint() {
            return this.dv.getInt32(this.inc(4), true);
        }
        readFloat() {
            return this.dv.getFloat32(this.inc(4), true);
        }
        readDouble() {
            return this.dv.getFloat64(this.inc(8), true);
        }
        readBitArray(bitLength) {
            let nBytes = Math.ceil(bitLength / 8);
            return new BitArray(new Uint8Array(this.dv.buffer, this.inc(nBytes), nBytes), bitLength);
        }
        readVarInt() {
            let n = 0;
            let p = 0;
            let b;
            while ((b = this.dv.getUint8(this.offset++)) >= 128) {
                n += (b & 127) << p;
                p += 7;
            }
            return n + (b << p);
        }
        readVarIntNeg() {
            let x = this.readVarInt();
            return x % 2 == 0 ? x / 2 : -(x + 1) / 2;
        }
        readString() {
            let len = this.readVarInt();
            let s = "";
            while (len-- > 0) {
                let c = this.readByte();
                let cc = c >> 4;
                if (cc < 8)
                    s += String.fromCharCode(c);
                else if (cc === 12 || c === 13) {
                    s += String.fromCharCode(((c & 0x1F) << 6) | (this.readByte() & 0x3F));
                    len--;
                }
                else if (cc === 14) {
                    s += String.fromCharCode(((c & 0x0F) << 12) | ((this.readByte() & 0x3F) << 6) | ((this.readByte() & 0x3F) << 0));
                    len -= 2;
                }
            }
            return s;
        }
        readInternedString() {
            let idx = this.readVarInt();
            if (idx < this.stringTable.length)
                return this.stringTable[idx];
            let s = this.readString();
            this.stringTable.push(s);
            return s;
        }
    }
    A.DataViewReader = DataViewReader;
})(A || (A = {}));
var A;
(function (A) {
    class Afcp3Reader {
        constructor() {
            this.mapArea = {};
            this.objectCache = {};
        }
        deserialize(dvr) {
            dvr.readUint();
            let packet = {};
            packet.id = this.packetId = dvr.readVarInt();
            packet.serverTicks = dvr.readVarInt();
            let generalFlags = dvr.readBitArray(4);
            let flagIndex = 0;
            if (generalFlags.getBit(flagIndex++))
                packet.playerId = dvr.readVarInt();
            if (generalFlags.getBit(flagIndex++))
                packet.controlledObjId = dvr.readVarInt();
            if (generalFlags.getBit(flagIndex++))
                packet.team = dvr.readByte();
            packet.asteroids = this.readArray(dvr, () => this.readAsteroid(dvr));
            packet.missiles = this.readArray(dvr, () => this.readMissile(dvr));
            packet.spaceships = this.readArray(dvr, () => this.readSpaceship(dvr));
            packet.effects = this.readArray(dvr, () => this.readEffect(dvr));
            packet.movingEffects = this.readArray(dvr, () => this.readMovingEffect(dvr));
            packet.capturePoints = this.readArray(dvr, () => this.readCapturePoint(dvr));
            packet.players = this.readArray(dvr, () => this.readPlayer(dvr));
            if (generalFlags.getBit(flagIndex++))
                packet.chatMessage = this.readChat(dvr);
            for (let id in this.objectCache)
                if (this.objectCache[id].packetId !== this.packetId)
                    delete this.objectCache[id];
            return packet;
        }
        readNumberCentiUnit16(dvr) {
            return dvr.readInt16() / 100;
        }
        readPoint(dvr) {
            return { x: dvr.readDouble(), y: dvr.readDouble() };
        }
        readPointCentiUnit16(dvr) {
            return { x: dvr.readInt16() / 100, y: dvr.readInt16() / 100 };
        }
        readRelPointCentiUnit16(dvr, prevValue) {
            return { x: prevValue.x + dvr.readVarIntNeg() / 100, y: prevValue.y + dvr.readVarIntNeg() / 100 };
        }
        readRectangleCentiUnit16(dvr) {
            return { x: dvr.readInt16() / 100, y: dvr.readInt16() / 100, w: dvr.readInt16() / 100, h: dvr.readInt16() / 100 };
        }
        readArray(dvr, reader) {
            let n = dvr.readVarInt();
            let a = [];
            for (let i = 0; i < n; i++)
                a.push(reader());
            return a;
        }
        readAsteroid(dvr) {
            let id = dvr.readVarInt();
            let flags = dvr.readBitArray(3);
            let ret = { id };
            let flagIndex = 0;
            if (flags.getBit(flagIndex++))
                ret.type = dvr.readInternedString();
            if (flags.getBit(flagIndex++))
                ret.p = this.readPointCentiUnit16(dvr);
            if (flags.getBit(flagIndex++))
                ret.r = this.readNumberCentiUnit16(dvr);
            return ret;
        }
        readMissile(dvr) {
            let id = dvr.readVarInt();
            let cache = this.objectCache[id] || (this.objectCache[id] = { packetId: this.packetId, p: { x: 0, y: 0 }, v: { x: 0, y: 0 }, a: { x: 0, y: 0 } });
            cache.packetId = this.packetId;
            let flags = dvr.readBitArray(8);
            let ret = { id };
            let flagIndex = 0;
            if (flags.getBit(flagIndex++))
                ret.type = dvr.readInternedString();
            if (flags.getBit(flagIndex++))
                ret.p = cache.p = this.readRelPointCentiUnit16(dvr, cache.p);
            if (flags.getBit(flagIndex++))
                ret.r = this.readNumberCentiUnit16(dvr);
            if (flags.getBit(flagIndex++))
                ret.team = dvr.readByte();
            if (flags.getBit(flagIndex++))
                ret.v = cache.v = this.readRelPointCentiUnit16(dvr, cache.v);
            if (flags.getBit(flagIndex++))
                ret.a = cache.a = this.readRelPointCentiUnit16(dvr, cache.a);
            if (flags.getBit(flagIndex++))
                ret.maxS = this.readNumberCentiUnit16(dvr);
            if (flags.getBit(flagIndex++))
                ret.maxA = this.readNumberCentiUnit16(dvr);
            return ret;
        }
        readSpaceship(dvr) {
            let nTurret = dvr.readByte();
            let id = dvr.readVarInt();
            let cache = this.objectCache[id] || (this.objectCache[id] = { packetId: this.packetId, p: { x: 0, y: 0 }, v: { x: 0, y: 0 }, a: { x: 0, y: 0 } });
            cache.packetId = this.packetId;
            let flags = dvr.readBitArray(10 + 7 * nTurret);
            let ret = { id };
            let flagIndex = 0;
            if (flags.getBit(flagIndex++))
                ret.type = dvr.readInternedString();
            if (flags.getBit(flagIndex++))
                ret.p = cache.p = this.readRelPointCentiUnit16(dvr, cache.p);
            if (flags.getBit(flagIndex++))
                ret.r = this.readNumberCentiUnit16(dvr);
            if (flags.getBit(flagIndex++))
                ret.team = dvr.readByte();
            if (flags.getBit(flagIndex++))
                ret.v = cache.v = this.readRelPointCentiUnit16(dvr, cache.v);
            if (flags.getBit(flagIndex++))
                ret.a = cache.a = this.readRelPointCentiUnit16(dvr, cache.a);
            if (flags.getBit(flagIndex++))
                ret.maxS = this.readNumberCentiUnit16(dvr);
            if (flags.getBit(flagIndex++))
                ret.maxA = this.readNumberCentiUnit16(dvr);
            if (flags.getBit(flagIndex++))
                ret.h = dvr.readVarInt();
            if (flags.getBit(flagIndex++))
                ret.maxH = dvr.readVarInt();
            if (flags.getBit(flagIndex++))
                ret.mods = dvr.readVarInt();
            ret.turrets = [];
            for (let i = 0; i < nTurret; i++) {
                let turret = {};
                if (flags.getBit(flagIndex++))
                    turret.playerId = dvr.readVarInt();
                if (flags.getBit(flagIndex++))
                    turret.e = dvr.readVarInt();
                if (flags.getBit(flagIndex++))
                    turret.maxE = dvr.readVarInt();
                if (flags.getBit(flagIndex++))
                    turret.pos = this.readPointCentiUnit16(dvr);
                turret.useShootingPosition = !!flags.getBit(flagIndex++);
                if (flags.getBit(flagIndex++))
                    turret.shootingPosition = this.readPointCentiUnit16(dvr);
                if (flags.getBit(flagIndex++)) {
                    let a = dvr.readUint();
                    turret.ability1ChargeStatus = a & 255;
                    turret.ability1Energy = (a >> 8) & 255;
                    turret.ability2ChargeStatus = (a >> 16) & 255;
                    turret.ability2Energy = a >> 24;
                }
                ret.turrets.push(turret);
            }
            return ret;
        }
        readEffect(dvr) {
            let id = dvr.readVarInt();
            let flags = dvr.readBitArray(4);
            let ret = { id };
            let flagIndex = 0;
            if (flags.getBit(flagIndex++))
                ret.type = dvr.readInternedString();
            if (flags.getBit(flagIndex++))
                ret.p = this.readPointCentiUnit16(dvr);
            if (flags.getBit(flagIndex++))
                ret.r = this.readNumberCentiUnit16(dvr);
            if (flags.getBit(flagIndex++))
                ret.ticksLeft = dvr.readVarInt();
            return ret;
        }
        readMovingEffect(dvr) {
            let id = dvr.readVarInt();
            let flags = dvr.readBitArray(4);
            let ret = { id };
            let flagIndex = 0;
            if (flags.getBit(flagIndex++))
                ret.type = dvr.readInternedString();
            if (flags.getBit(flagIndex++))
                ret.p = this.readPointCentiUnit16(dvr);
            if (flags.getBit(flagIndex++))
                ret.r = this.readNumberCentiUnit16(dvr);
            if (flags.getBit(flagIndex++))
                ret.v = this.readPointCentiUnit16(dvr);
            return ret;
        }
        readCapturePoint(dvr) {
            let id = dvr.readVarInt();
            let flags = dvr.readBitArray(5);
            let ret = { id };
            let flagIndex = 0;
            if (flags.getBit(flagIndex++))
                ret.type = dvr.readInternedString();
            if (flags.getBit(flagIndex++))
                ret.p = this.readPointCentiUnit16(dvr);
            if (flags.getBit(flagIndex++))
                ret.r = this.readNumberCentiUnit16(dvr);
            if (flags.getBit(flagIndex++))
                ret.team = dvr.readByte();
            if (flags.getBit(flagIndex++))
                ret.captureStatus = dvr.readInt8() / 100;
            return ret;
        }
        readPlayer(dvr) {
            let id = dvr.readVarInt();
            let flags = dvr.readBitArray(15);
            let ret = { id, stats: {} };
            let flagIndex = 0;
            if (flags.getBit(flagIndex++))
                ret.name = dvr.readString();
            if (flags.getBit(flagIndex++))
                ret.team = dvr.readByte();
            ret.bot = !!flags.getBit(flagIndex++);
            if (flags.getBit(flagIndex++))
                ret.respawnIn = dvr.readVarInt();
            if (flags.getBit(flagIndex++))
                ret.stats.score = dvr.readVarInt();
            if (flags.getBit(flagIndex++))
                ret.stats.scorePerHour = dvr.readVarInt();
            if (flags.getBit(flagIndex++))
                ret.stats.kills = dvr.readVarInt();
            if (flags.getBit(flagIndex++))
                ret.stats.deaths = dvr.readVarInt();
            if (flags.getBit(flagIndex++))
                ret.stats.damageDone = dvr.readVarInt();
            if (flags.getBit(flagIndex++))
                ret.stats.damageTaken = dvr.readVarInt();
            if (flags.getBit(flagIndex++))
                ret.stats.healingDone = dvr.readVarInt();
            if (flags.getBit(flagIndex++))
                ret.stats.energySpent = dvr.readVarInt();
            if (flags.getBit(flagIndex++))
                ret.stats.energyRestored = dvr.readVarInt();
            if (flags.getBit(flagIndex++))
                ret.stats.mapObjectiveScore = dvr.readVarInt();
            if (flags.getBit(flagIndex++))
                ret.spaceshipType = dvr.readInternedString();
            return ret;
        }
        readChat(dvr) {
            return {
                type: dvr.readVarInt(),
                time: Date.now(),
                from: dvr.readVarInt(),
                text: dvr.readString()
            };
        }
    }
    A.Afcp3Reader = Afcp3Reader;
})(A || (A = {}));
var A;
(function (A) {
    class EventObject {
        constructor() {
            this.listeners = [];
        }
        add(callback, scope) {
            this.listeners.push({ callback, scope });
        }
        remove(callback) {
            this.listeners = this.listeners.filter(x => x.callback !== callback);
        }
        removeAll(scope) {
            if (!scope)
                throw new Error("Must specify object");
            this.listeners = this.listeners.filter(x => x.scope !== scope);
        }
        raise(arg) {
            for (let listener of this.listeners)
                listener.callback.call(listener.scope, arg);
        }
    }
    A.EventObject = EventObject;
})(A || (A = {}));
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var A;
(function (A) {
    class UserMgr {
        get loggedIn() {
            return !!this.user;
        }
        get upgrades() {
            var _a;
            return (_a = this.user) === null || _a === void 0 ? void 0 : _a.upgrades;
        }
        getUsableUnitTypes() {
            let ret = ["Fighter"];
            for (let u of this.upgrades) {
                if (u.name === "Unlock" && u.rank > 0 && ret.indexOf(u.unitType) === -1)
                    ret.push(u.unitType);
            }
            return ret;
        }
        buyUpgrade(id) {
            return __awaiter(this, void 0, void 0, function* () {
                let credit = yield A.connector.BuyUpgrade(id);
                this.user.currentCredit = credit;
                this.upgrades.find(x => x.id === id).rank++;
            });
        }
        sellUpgrade(id) {
            return __awaiter(this, void 0, void 0, function* () {
                let credit = yield A.connector.SellUpgrade(id);
                this.user.currentCredit = credit;
                this.upgrades.find(x => x.id === id).rank--;
            });
        }
    }
    A.UserMgr = UserMgr;
    A.userMgr = new UserMgr();
})(A || (A = {}));
var A;
(function (A) {
    class Connector {
        constructor() {
            this.address = `${document.location.protocol === "https:" ? "wss" : "ws"}://${document.location.port !== "80" && document.location.port !== "443" ? "beta.asterofight.com" : document.location.hostname || "localhost"}/af/game/`;
            this.protocol = "afcp";
            this.packetEvent = new A.EventObject();
            this.userEvent = new A.EventObject();
            this.connectionEvent = new A.EventObject();
            this.lastPacketTime = 0;
            this.lastPacketId = 0;
            this.stringTable = [];
            this.afcpReader = new A.Afcp3Reader();
            this.delayedPackets = [];
            this.pendingCalls = [];
            this.lastCallId = 1;
            this.bytesReceivedHistory = [];
            this.connect();
        }
        test() {
            return this.address;
        }
        connect() {
            this.webSocket = new WebSocket(this.address, this.protocol);
            this.webSocket.binaryType = "arraybuffer";
            this.webSocket.onmessage = e => this.onMessage(e.data);
            this.webSocket.onopen = () => this.onOpen();
            this.webSocket.onclose = () => this.onClose();
        }
        onMessage(data) {
            if (typeof data === "string") {
                let obj = JSON.parse(data);
                if (obj.mapArea) {
                    A.game.onMap(obj);
                }
                else {
                    let pendingCallIdx = this.pendingCalls.findIndex(x => x.callId === obj.i);
                    let pendingCall = this.pendingCalls.splice(pendingCallIdx, 1)[0];
                    if (obj.e)
                        pendingCall.reject(obj.e);
                    else
                        pendingCall.resolve(obj.r);
                }
            }
            else {
                this.updatePacketHistory(data.byteLength);
                let packet = this.afcpReader.deserialize(new A.DataViewReader(new DataView(data), this.stringTable));
                this.lastPacketId = packet.id;
                A.game.onPacket(packet);
                this.packetEvent.raise(packet);
            }
        }
        onOpen() {
            return __awaiter(this, void 0, void 0, function* () {
                this.connectionEvent.raise("connected");
                this.stringTable = [""];
                if (A.game.playerId)
                    this.AttachPlayer(A.game.playerId);
                else {
                    let token = localStorage["loginToken"];
                    if (token) {
                        let ret = yield this.callAsync("LoginWithToken", { token });
                        if (typeof ret !== "string") {
                            A.userMgr.user = ret;
                            if (A.userMgr.user.loginToken)
                                localStorage["loginToken"] = A.userMgr.user.loginToken;
                            this.userEvent.raise();
                        }
                        else
                            localStorage.removeItem("loginToken");
                    }
                }
            });
        }
        onClose() {
            this.connectionEvent.raise("disconnected");
            setTimeout(() => this.connect(), 5000);
        }
        Ack() {
            return this.callAsync("Ack", {});
        }
        Register(email, password, name) {
            return this.callAsync("Register", { email, password, name });
        }
        Login(email, password, generateToken) {
            return __awaiter(this, void 0, void 0, function* () {
                let ret = yield this.callAsync("Login", { email, password, generateToken });
                if (typeof ret !== "string") {
                    A.userMgr.user = ret;
                    if (A.userMgr.user.loginToken)
                        localStorage["loginToken"] = A.userMgr.user.loginToken;
                    this.userEvent.raise();
                    return "";
                }
                return ret;
            });
        }
        Logout() {
            localStorage.removeItem("loginToken");
            this.call("Logout", {});
            A.userMgr.user = undefined;
            this.userEvent.raise();
        }
        CreatePlayer(name) {
            this.call("CreatePlayer", { name });
        }
        AttachPlayer(playerId) {
            this.call("AttachPlayer", { playerId });
        }
        DestroyPlayer() {
            this.call("DestroyPlayer", {});
        }
        Control(x, y) {
            this.call("Control", { x, y });
        }
        Use(x, y, ability) {
            this.call("Use", { x, y, ability });
        }
        SwitchSpaceship(type) {
            this.call("SwitchSpaceship", { type });
        }
        SwapTeam() {
            this.call("SwapTeam", {});
        }
        SendChatMessage(to, text) {
            this.call("SendChatMessage", { to, text });
        }
        BuyUpgrade(id) {
            return this.callAsync("BuyUpgrade", { id });
        }
        SellUpgrade(id) {
            return this.callAsync("SellUpgrade", { id });
        }
        call(method, parameters) {
            if (!this.webSocket || this.webSocket.readyState !== 1)
                return;
            let session = { lastPacketId: this.lastPacketId };
            parameters.session = session;
            this.webSocket.send(JSON.stringify({ m: method, p: parameters, s: session }));
        }
        callAsync(method, parameters) {
            return new Promise((resolve, reject) => {
                if (!this.webSocket || this.webSocket.readyState !== 1)
                    reject("no connection");
                else {
                    let session = { lastPacketId: this.lastPacketId };
                    let callId = ++this.lastCallId;
                    this.pendingCalls.push({ callId, resolve, reject });
                    this.webSocket.send(JSON.stringify({ i: callId, m: method, p: parameters, s: session }));
                }
            });
        }
        updatePacketHistory(packetLength) {
            let now = performance.now();
            A.debug.updateNetwork(now - this.lastPacketTime);
            this.lastPacketTime = now;
            this.bytesReceivedHistory.push({ time: now, length: packetLength });
            while (this.bytesReceivedHistory.length > 0 && now - this.bytesReceivedHistory[0].time > 1000)
                this.bytesReceivedHistory.shift();
            A.debug.updateChart("Bandwidth", this.bytesReceivedHistory.reduce((p, c) => p + c.length, 0) / 1024, 0, 100, "KB/s");
        }
    }
    A.Connector = Connector;
    A.connector = new Connector();
})(A || (A = {}));
var A;
(function (A) {
    class Vector2 {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }
        add(v) { return new Vector2(this.x + v.x, this.y + v.y); }
        sub(v) { return new Vector2(this.x - v.x, this.y - v.y); }
        mul(t) { return new Vector2(this.x * t, this.y * t); }
        neg() { return new Vector2(-this.x, -this.y); }
        eq(v) { return this.x === v.x && this.y === v.y; }
        notEq(v) { return this.x !== v.x || this.y !== v.y; }
        dist(v) { return Math.sqrt((this.x - v.x) * (this.x - v.x) + (this.y - v.y) * (this.y - v.y)); }
        distS(v) { return (this.x - v.x) * (this.x - v.x) + (this.y - v.y) * (this.y - v.y); }
        dot(v) { return this.x * v.x + this.y * v.y; }
        lerp(v, t) { return new Vector2(this.x + (v.x - this.x) * t, this.y + (v.y - this.y) * t); }
        norm() { let f = 1 / this.len; return new Vector2(this.x * f, this.y * f); }
        clone() { return new Vector2(this.x, this.y); }
        clamp(len) { let lenS = this.lenS; return lenS <= len * len ? this : this.mul(len / Math.sqrt(lenS)); }
        setCoords(x, y) { this.x = x; this.y = y; return this; }
        get len() { return Math.sqrt(this.x * this.x + this.y * this.y); }
        get lenS() { return this.x * this.x + this.y * this.y; }
        get rotation() { return Math.atan2(this.y, this.x); }
        static get one() { return new Vector2(1, 1); }
        static get zero() { return new Vector2(0, 0); }
    }
    A.Vector2 = Vector2;
})(A || (A = {}));
var A;
(function (A) {
    class Renderer {
        constructor(canvas) {
            this.canvas = canvas;
            this.onRender = new BABYLON.Observable();
            this.orientationRightToLeft = false;
            this.orientationPortrait = false;
            this.pixelCount = 0;
            this.debugNumbers = {};
            this.targetCamPos = new A.Vector2();
            this.camDistance = 100;
            this.calcPixelCount = () => {
                this.pixelCount = this.engine.getRenderWidth() * this.engine.getRenderHeight();
            };
            this.render = () => {
                let scene = this.engine.scenes[0];
                this.onRender.notifyObservers(scene);
                let dx = (this.targetCamPos.x - this.camera.position.x) * .1;
                let dy = (this.targetCamPos.y - this.camera.position.y) * .1;
                let x = this.camera.position.x + dx;
                let y = this.camera.position.y + dy;
                this.camera.setTarget(new BABYLON.Vector3(x, y, 0));
                this.camera.position.set(x, y, -this.camDistance);
                scene.render();
                this.debugNumbers["FPS"] = this.engine.performanceMonitor.averageFPS;
                this.debugNumbers["Frame Time"] = this.sceneInstrumentation.frameTimeCounter.current;
            };
            this.resize = () => {
                if (this.engine)
                    this.rearrange();
            };
            this.engine = new BABYLON.Engine(canvas, true);
            this.engine.setHardwareScalingLevel(1 / window.devicePixelRatio);
            this.engine.onResizeObservable.add(this.calcPixelCount);
            this.calcPixelCount();
            window.addEventListener("resize", this.resize);
            this.scene = new BABYLON.Scene(this.engine);
            this.scene.clearColor = new BABYLON.Color4(.01, .01, .01, 1);
            this.sceneInstrumentation = new BABYLON.SceneInstrumentation(this.scene);
            this.sceneInstrumentation.captureFrameTime = true;
            this.camera = new BABYLON.TargetCamera("", new BABYLON.Vector3(0, 0, -this.camDistance), this.scene, true);
            this.camera.minZ = this.camDistance - 20;
            this.camera.maxZ = this.camDistance + 20;
            let ambient = new BABYLON.HemisphericLight("ambient", new BABYLON.Vector3(0, 1, 2), this.scene);
            ambient.groundColor.set(0.2, 0.3, 0.2);
            ambient.diffuse.set(.88, .93, 1);
            ambient.direction.set(0, 0.9, 1.5);
            ambient.intensity = 0.1;
            this.lightHemi = ambient;
            let direct = new BABYLON.DirectionalLight("sun", new BABYLON.Vector3(0.8, -1, 1), this.scene);
            direct.intensity = 2;
            this.lightDirect = direct;
        }
        get width() {
            return this.engine.getRenderWidth();
        }
        get height() {
            return this.engine.getRenderHeight();
        }
        start() {
            this.rearrange();
            this.engine.runRenderLoop(this.render);
        }
        stop() {
            this.engine.stopRenderLoop();
        }
        setTeam(rightToLeft) {
            if (this.orientationRightToLeft !== rightToLeft) {
                this.orientationRightToLeft = rightToLeft;
                this.rearrange();
            }
        }
        setCameraTarget(gamePos) {
            this.targetCamPos = gamePos;
        }
        getGameCoords(clientX, clientY) {
            let picked = this.scene.pick(clientX, clientY);
            if (picked === null || picked === void 0 ? void 0 : picked.ray) {
                let ip = picked.ray.intersectsPlane(new BABYLON.Plane(0, 0, 1, 0));
                if (ip)
                    return new A.Vector2(picked.ray.origin.x + picked.ray.direction.x * ip, picked.ray.origin.y + picked.ray.direction.y * ip);
            }
            return new A.Vector2();
        }
        rearrange() {
            this.engine.resize();
            let aspectRatio = this.engine.getRenderWidth() / this.engine.getRenderHeight();
            this.orientationPortrait = aspectRatio < 1;
            if (!this.orientationPortrait) {
                let h = Math.min(40 / aspectRatio, 22.5);
                this.camera.fovMode = BABYLON.Camera.FOVMODE_VERTICAL_FIXED;
                this.camera.fov = Math.atan(h / this.camDistance) * 2;
                this.camera.upVector = this.orientationRightToLeft ? BABYLON.Vector3.Down() : BABYLON.Vector3.Up();
            }
            else {
                let h = Math.min(45 / 2 * aspectRatio / 9 * 16, 22.5);
                this.camera.fovMode = BABYLON.Camera.FOVMODE_HORIZONTAL_FIXED;
                this.camera.fov = Math.atan(h / this.camDistance) * 2;
                this.camera.upVector = this.orientationRightToLeft ? BABYLON.Vector3.Left() : BABYLON.Vector3.Right();
            }
            let lightDir = BABYLON.Vector3.TransformCoordinates(this.camera.upVector.negate(), BABYLON.Matrix.RotationAxis(BABYLON.Axis.Z, Math.PI / 4)).add(BABYLON.Axis.Z);
            this.lightHemi.direction = lightDir;
            this.lightDirect.direction = lightDir;
        }
    }
    A.Renderer = Renderer;
    A.renderer = new Renderer(document.querySelector("canvas"));
    window.addEventListener("load", () => A.renderer.start());
})(A || (A = {}));
var A;
(function (A) {
    class AssetObject {
        constructor(name) {
            this.name = name;
            this.instances = [];
            this.isLoaded = false;
            this.canBeInstanced = false;
            if (name === "Asteroid")
                this.load();
            else {
                this.container = new BABYLON.AssetContainer(A.renderer.scene);
                let mesh = name === "CapturePoint" ? BABYLON.MeshBuilder.CreateSphere("", { diameter: .01 }) :
                    name === "Fighter" ? BABYLON.MeshBuilder.CreateBox("", { size: 1 }) :
                        BABYLON.MeshBuilder.CreateSphere("", { diameter: 1 });
                this.container.meshes.push(mesh);
                this.container.removeAllFromScene();
                this.canBeInstanced = true;
                this.isLoaded = true;
            }
        }
        load() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.name === "Asteroid") {
                    this.container = yield BABYLON.SceneLoader.LoadAssetContainerAsync("./assets/", "asteroid.glb", A.renderer.scene);
                    this.isLoaded = true;
                }
                for (let i of this.instances)
                    i.onAssetLoaded();
            });
        }
        createInstance() {
            let ret = new A.AssetInstance(this);
            this.instances.push(ret);
            return ret;
        }
        destroyInstance(instance) {
            this.instances.splice(this.instances.indexOf(instance));
        }
    }
    A.AssetObject = AssetObject;
})(A || (A = {}));
var A;
(function (A) {
    class AssetInstance {
        constructor(asset) {
            this.asset = asset;
            if (asset.isLoaded)
                this.onAssetLoaded();
        }
        onAssetLoaded() {
            if (this.asset.canBeInstanced)
                this.root = this.asset.container.meshes[0].createInstance("");
            else {
                this.entries = this.asset.container.instantiateModelsToScene();
                this.root = this.entries.rootNodes[0];
                this.root.rotationQuaternion = null;
                let ani = new BABYLON.Animation("", "rotation.y", .01, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                ani.setKeys([{ frame: 0, value: 0 }, { frame: 1, value: 2 * Math.PI }]);
                this.root.animations.push(ani);
                A.renderer.scene.beginAnimation(this.root, 0, 1, true);
            }
        }
        setPos(x, y, z = 0, x2, y2, z2) {
            var _a;
            (_a = this.root) === null || _a === void 0 ? void 0 : _a.position.set(x, y, z);
        }
        setUniformScale(x) {
            var _a;
            (_a = this.root) === null || _a === void 0 ? void 0 : _a.scaling.setAll(x);
        }
        setState(state) {
        }
        destroy() {
            if (this.root)
                this.root.dispose();
            if (this.entries)
                this.asset.container.removeAllFromScene();
            this.asset.destroyInstance(this);
        }
    }
    A.AssetInstance = AssetInstance;
})(A || (A = {}));
var A;
(function (A) {
    class AssetMgr {
        constructor() {
            this.assets = {};
        }
        createInstance(name) {
            let asset = this.assets[name];
            if (!asset)
                this.assets[name] = asset = new A.AssetObject(name);
            return asset.createInstance();
        }
    }
    A.AssetMgr = AssetMgr;
    A.assetMgr = new AssetMgr();
})(A || (A = {}));
var A;
(function (A) {
    class Verlet {
        constructor() {
            this.position = A.Vector2.zero;
            this.velocity = A.Vector2.zero;
            this.acceleration = A.Vector2.zero;
        }
        step(dt, a) {
            if (a)
                this.acceleration = this.maxAcceleration ? a.clamp(this.maxAcceleration) : a;
            let dp = this.velocity.mul(dt).add(this.acceleration.mul(dt * dt));
            if (this.maxSpeed)
                dp = dp.clamp(this.maxSpeed);
            this.position = this.position.add(dp);
            this.velocity = dp.mul(1 / dt);
            return this.position;
        }
        reset(p = A.Vector2.zero, v = A.Vector2.zero, a = A.Vector2.zero, maxSpeed, maxAcceleration) {
            this.position = p;
            this.velocity = maxSpeed ? v.clamp(maxSpeed) : v;
            this.acceleration = maxAcceleration ? a.clamp(maxAcceleration) : a;
            this.maxSpeed = maxSpeed;
            this.maxAcceleration = maxAcceleration;
        }
    }
    A.Verlet = Verlet;
})(A || (A = {}));
var A;
(function (A) {
    class DebugData {
        constructor() {
            this.charts = [];
            this.packetHistory = [];
            this.unsentPacketHistoryCount = 0;
            this.fpsTimes = [];
            this.fpsLastValueTime = 0;
            this.fpsHistory = [];
            this.unsentFpsHistoryCount = 0;
        }
        get currentFps() { return this.fpsHistory.length > 0 ? this.fpsHistory[this.fpsHistory.length - 1] : 0; }
        updateChart(name, value, min, max, unit, length) {
            let chart = this.charts.find(x => x.name === name) || (this.charts[this.charts.push({ name, values: [], min, max, unit }) - 1]);
            chart.values.pushShift(value, length !== null && length !== void 0 ? length : 60);
        }
        updateNetwork(interval) {
            this.updateChart("Network", interval, 0, 200, "ms");
            this.unsentPacketHistoryCount++;
        }
        updateFPS() {
            let now = performance.now();
            this.fpsTimes.pushShift(now, 60);
            if (this.fpsTimes.length > 1 && now > this.fpsLastValueTime + 500) {
                this.fpsLastValueTime = now;
                this.fpsHistory.pushShift((this.fpsTimes.length - 1) * 1000 / (this.fpsTimes[this.fpsTimes.length - 1] - this.fpsTimes[0]), 60);
                this.updateChart("FPS", (this.fpsTimes.length - 1) * 1000 / (this.fpsTimes[this.fpsTimes.length - 1] - this.fpsTimes[0]), 0, 120, "/s");
                this.unsentFpsHistoryCount++;
            }
        }
    }
    A.DebugData = DebugData;
    A.debug = new DebugData();
})(A || (A = {}));
var A;
(function (A) {
    class ServerTime {
        constructor() {
            this.zeroServerTimeInLocalTime = 0;
            this.time = 0;
            this.timeSincePacket = 0;
            this.packetTicks = 0;
            this.packetTime = 0;
            this.renderDelta = 0.001;
            this.currentDsct = 0;
            this.targetDsct = 0;
            this.lastUpdate = 0;
            this.lastMeasure = 0;
        }
        onPacket(serverTicks) {
            return __awaiter(this, void 0, void 0, function* () {
                let now = performance.now() * 0.001;
                this.packetTicks = serverTicks;
                this.packetTime = now;
                this.targetDsct = this.packetTime - now;
                let diff = Math.abs(this.targetDsct - this.currentDsct);
                if (diff > 0.1)
                    this.currentDsct = this.targetDsct;
                if (!this.zeroServerTimeInLocalTime)
                    this.zeroServerTimeInLocalTime = Date.now() - this.packetTime * 1000;
                if (now - this.lastMeasure > 1) {
                    this.lastMeasure = now;
                    let t0 = performance.now();
                    yield A.connector.Ack();
                    let t1 = performance.now();
                    A.debug.updateChart("Ping", (t1 - t0), 0, 500, "ms");
                }
            });
        }
        onRender() {
            let maxAdjustment = 0.0001;
            let adjustment = (this.targetDsct - this.currentDsct) * 0.001;
            this.currentDsct += Math.min(maxAdjustment, Math.max(-maxAdjustment, adjustment));
            this.time = performance.now() * 0.001 + this.currentDsct;
            this.timeSincePacket = this.time - this.packetTime;
            if (this.lastUpdate)
                this.renderDelta = this.time - this.lastUpdate;
            this.lastUpdate = this.time;
        }
        toLocalTime(t) {
            return new Date(this.zeroServerTimeInLocalTime + t * 1000);
        }
    }
    ServerTime.serverTickInterval = 0.05;
    ServerTime.serverSendInterval = 0.1;
    A.ServerTime = ServerTime;
    A.serverTime = new ServerTime();
})(A || (A = {}));
var A;
(function (A) {
    class ServerMotion {
        constructor() {
            this.packets = [];
        }
        addPacket(p, v, a, maxSpeed) {
            this.packets.push({ t: A.serverTime.packetTime, p, v, a, maxSpeed });
        }
        getPositionAt(t) {
            if (this.packets.length === 0)
                return A.Vector2.zero;
            let i = this.packets.length - 1;
            while (i >= 0 && this.packets[i].t > t)
                i--;
            if (i < 0)
                return this.packets[0].p;
            let pck = this.packets[i];
            let npck = this.packets[i + 1];
            if (i > 0)
                this.packets.shift();
            if (npck)
                return pck.p.lerp(npck.p, (t - pck.t) / (npck.t - pck.t));
            let dt = t - pck.t;
            return pck.p.add(pck.v.mul(dt)).add(pck.a.mul(dt * dt * 0.5));
        }
    }
    A.ServerMotion = ServerMotion;
})(A || (A = {}));
var A;
(function (A) {
    class PidController {
        constructor(Kp = 1, Ki = 0, Kd = 0, maxOutput) {
            this.Kp = Kp;
            this.Ki = Ki;
            this.Kd = Kd;
            this.maxOutput = maxOutput;
            this.output = new A.Vector2();
            this.pError = new A.Vector2();
            this.integral = new A.Vector2();
            this.reset();
        }
        step(error, dt) {
            this.integral = this.integral.add(error.mul(dt * this.Ki));
            let d = error.sub(this.pError).mul(this.Kd / dt);
            this.output = error.mul(this.Kp).add(this.integral).add(d);
            if (this.maxOutput) {
                this.integral = this.integral.clamp(this.maxOutput);
                this.output = this.output.clamp(this.maxOutput);
            }
            this.pError = error;
            return this.output;
        }
        reset() {
            this.pError = A.Vector2.zero;
            this.integral = A.Vector2.zero;
        }
    }
    A.PidController = PidController;
})(A || (A = {}));
var A;
(function (A) {
    class MapObject {
        constructor(canMove, id, type) {
            this.canMove = canMove;
            this.id = id;
            this.type = type;
            this.lastSeenPacketId = A.game.packetId;
            this.r = 0;
            this.team = 0;
            this.renderPosition = new A.Vector2();
            this.lastKnownP = new A.Vector2();
            this.ai = A.assetMgr.createInstance(type);
        }
        destroy() {
            this.ai.destroy();
        }
        update(od) {
            this.lastSeenPacketId = A.game.packetId;
            if (od.type !== undefined)
                this.type = od.type;
            if (od.r !== undefined)
                this.r = od.r;
            if (od.team !== undefined)
                this.team = od.team;
            if (od.p !== undefined) {
                this.lastKnownP.setCoords(od.p.x, od.p.y);
                if (!this.canMove)
                    this.renderPosition = this.lastKnownP;
            }
            this.ai.setUniformScale(this.r * 2);
        }
        render() {
            this.ai.setPos(this.renderPosition.x, this.renderPosition.y);
        }
    }
    A.MapObject = MapObject;
    class MovingObject extends MapObject {
        constructor(id, type) {
            super(true, id, type);
            this.lastKnownV = new A.Vector2();
            this.lastKnownA = new A.Vector2();
            this.maxS = 0;
            this.maxA = 0;
            this.clientMotion = new A.Verlet();
            this.serverMotion = new A.ServerMotion();
            this.pid = new A.PidController(50, 2, 15, 50);
        }
        update(od) {
            super.update(od);
            if (od.v)
                this.lastKnownV.setCoords(od.v.x, od.v.y);
            if (od.a)
                this.lastKnownA.setCoords(od.a.x, od.a.y);
            if (od.maxS !== undefined)
                this.maxS = od.maxS;
            if (od.maxA !== undefined)
                this.maxA = od.maxA;
            this.serverMotion.addPacket(this.lastKnownP, this.lastKnownV, this.lastKnownA, this.maxS);
            if (this.lastKnownP.sub(this.renderPosition).lenS > 4)
                this.clientMotion.reset(this.lastKnownP, this.lastKnownV, this.lastKnownA);
            this.ai.setUniformScale(this.r * 2);
        }
        render() {
            let p = this.serverMotion.getPositionAt(A.serverTime.time);
            this.renderPosition = this.clientMotion.step(1 / 60, this.pid.step(p.sub(this.clientMotion.position), 1 / 60));
            super.render();
        }
    }
    A.MovingObject = MovingObject;
})(A || (A = {}));
var A;
(function (A) {
    class Rectangle {
        constructor(x = 0, y = 0, w = 0, h = 0) {
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
        }
        clone() { return new Rectangle(this.x, this.y, this.w, this.h); }
        static get zero() { return new Rectangle(0, 0, 0, 0); }
    }
    A.Rectangle = Rectangle;
})(A || (A = {}));
var A;
(function (A) {
    class Map {
        constructor() {
            this.mapArea = new A.Rectangle(-40, -22.5, 80, 45);
            this.asteroids = [];
            this.maxGravityRadius = 25;
        }
        getGravity(mo) {
            var ret = new A.Vector2();
            for (let obj of this.asteroids)
                ret = ret.add(this.getGravity1(obj, mo));
            return ret;
        }
        getGravity1(obj, mo) {
            let ds = mo.renderPosition.distS(obj.renderPosition);
            var g = obj.m / ds;
            return obj.renderPosition.sub(mo.renderPosition).mul(g).mul(1 / Math.sqrt(ds));
        }
    }
    A.Map = Map;
})(A || (A = {}));
var A;
(function (A) {
    class Asteroid extends A.MapObject {
        constructor(od) {
            super(false, od.id, "Asteroid");
            this.m = 0;
        }
        render() {
            this.ai.setPos(this.renderPosition.x, this.renderPosition.y);
        }
    }
    A.Asteroid = Asteroid;
})(A || (A = {}));
var A;
(function (A) {
    class Effect extends A.MapObject {
        constructor(od) {
            super(false, od.id, od.type);
            this.startTime = 0;
            this.endTime = 0;
            this.lastSeenPacketId = 0;
            this.fade = false;
        }
        update(od) {
            super.update(od);
            if (this.startTime === 0)
                this.startTime = A.serverTime.packetTime;
            if (od.ticksLeft !== undefined)
                this.endTime = (A.serverTime.packetTicks + od.ticksLeft) * A.ServerTime.serverTickInterval;
        }
        draw() {
        }
    }
    A.Effect = Effect;
})(A || (A = {}));
var A;
(function (A) {
    class MovingEffect extends A.MovingObject {
        constructor(od) {
            super(od.id, od.type);
        }
        destroy() {
        }
        update(od) {
            super.update(od);
        }
        draw() {
        }
    }
    A.MovingEffect = MovingEffect;
})(A || (A = {}));
var A;
(function (A) {
    class ParticleSystem {
        constructor() {
            this.emitterP = new A.Vector2();
            this.emitterV = new A.Vector2();
            this.emitting = false;
            this.interval = 0.01;
            this.fade = 1.5;
            this.randomize = 1;
            this.lastEmit = 0;
            this.particles = [];
        }
        draw() {
            let now = A.serverTime.time;
            while (this.particles.length > 0 && now - this.particles[0].createdAt > this.fade)
                this.particles.shift();
            if (this.emitting && now >= this.lastEmit + this.interval) {
                this.lastEmit = now;
                let v = this.emitterV;
                if (this.randomize) {
                    v.x += ((now * 1000) % 1) * this.randomize * 2 - this.randomize;
                    v.y += ((now * 100) % 1) * this.randomize * 2 - this.randomize;
                }
                this.particles.push({ position: this.emitterP, velocity: v, createdAt: now });
            }
        }
    }
    A.ParticleSystem = ParticleSystem;
})(A || (A = {}));
var A;
(function (A) {
    class CapturePoint extends A.MapObject {
        constructor(od) {
            super(false, od.id, "CapturePoint");
            this.status = 0;
        }
        update(od) {
            super.update(od);
            if (od.captureStatus !== undefined) {
                this.status = od.captureStatus;
                let color = this.team === 0 ? 0x808080 : this.team === A.game.team ? 0x0000ff : 0xff0000;
            }
        }
    }
    A.CapturePoint = CapturePoint;
})(A || (A = {}));
var A;
(function (A) {
    class Missile extends A.MovingObject {
        constructor(od) {
            super(od.id, od.type);
        }
        update(od) {
            super.update(od);
            if (od.team !== undefined) {
                if (od.team === A.game.team) {
                }
                else {
                }
            }
        }
        draw() {
        }
    }
    A.Missile = Missile;
})(A || (A = {}));
var A;
(function (A) {
    class Turret {
        constructor(parent) {
            this.parent = parent;
            this.playerId = 0;
            this.e = 0;
            this.maxE = 0;
            this.pos = new A.Vector2();
            this.shootingPosition = null;
            this.a1ChargeStatus = 0;
            this.a2ChargeStatus = 0;
            this.a1Energy = 0;
            this.a2Energy = 0;
            this.energyBarIsDirty = true;
            this.cooldownBarIsDirty = true;
        }
        destroy() {
        }
        update(pt) {
            var _a, _b;
            if (pt.playerId !== undefined)
                this.playerId = pt.playerId;
            if (pt.pos !== undefined)
                this.pos.setCoords(pt.pos.x, pt.pos.y);
            this.energyBarIsDirty = this.energyBarIsDirty || pt.e !== undefined;
            if (pt.e !== undefined)
                this.e = pt.e;
            if (pt.maxE !== undefined)
                this.maxE = pt.maxE;
            if (!pt.useShootingPosition)
                this.shootingPosition = null;
            else if (pt.shootingPosition !== undefined)
                this.shootingPosition = new A.Vector2(pt.shootingPosition.x, pt.shootingPosition.y);
            if (pt.ability1ChargeStatus !== undefined)
                this.a1ChargeStatus = pt.ability1ChargeStatus;
            if (pt.ability2ChargeStatus !== undefined) {
                this.a2ChargeStatus = pt.ability2ChargeStatus;
                this.cooldownBarIsDirty = true;
            }
            if (pt.ability1Energy !== undefined)
                this.a1Energy = pt.ability1Energy;
            if (pt.ability2Energy !== undefined)
                this.a2Energy = pt.ability2Energy;
            let name = this.playerId ? (_b = (_a = A.game.players.find(x => x.id === this.playerId)) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "" : "";
        }
        draw(resized) {
        }
    }
    A.Turret = Turret;
})(A || (A = {}));
var A;
(function (A) {
    class Spaceship extends A.MovingObject {
        constructor(od) {
            super(od.id, od.type);
            this.h = 0;
            this.maxH = 0;
            this.mods = 0;
            this.healthBarIsDirty = true;
            this.damageReductionAssetIsDirty = false;
            this.turrets = od.turrets.map(x => new A.Turret(this));
        }
        destroy() {
            super.destroy();
            this.turrets.forEach(x => x.destroy());
        }
        update(od) {
            super.update(od);
            this.healthBarIsDirty = this.healthBarIsDirty || od.h !== undefined;
            if (od.h !== undefined)
                this.h = od.h;
            if (od.maxH !== undefined)
                this.maxH = od.maxH;
            for (let i = 0; i < od.turrets.length; i++)
                this.turrets[i].update(od.turrets[i]);
        }
        makeBarsDirty() {
            this.healthBarIsDirty = true;
            for (let t of this.turrets) {
                t.cooldownBarIsDirty = true;
                t.energyBarIsDirty = true;
            }
        }
        render() {
            let p = this.serverMotion.getPositionAt(A.serverTime.time);
            p = this.clientMotion.step(A.serverTime.renderDelta, this.pid.step(p.sub(this.clientMotion.position), A.serverTime.renderDelta));
            for (let a of A.game.asteroids) {
                let rr = this.r + a.r;
                if (p.distS(a.renderPosition) < rr * rr) {
                    p = p.sub(a.renderPosition).norm().mul(rr).add(a.renderPosition);
                    break;
                }
            }
            this.renderPosition = p;
            this.ai.setPos(this.renderPosition.x, this.renderPosition.y);
        }
        draw(resized) {
            for (let turret of this.turrets)
                turret.draw(resized);
        }
    }
    A.Spaceship = Spaceship;
})(A || (A = {}));
var A;
(function (A) {
    class Player {
        constructor(od) {
            this.id = 0;
            this.name = "";
            this.team = 0;
            this.bot = false;
            this.respawnIn = 0;
            this.stats = { score: 0, scorePerHour: 0, kills: 0, deaths: 0, damageDone: 0, damageTaken: 0, healingDone: 0, energySpent: 0, energyRestored: 0, mapObjectiveScore: 0 };
            this.spaceshipType = "";
            this.lastSeenPacketId = 0;
            this.packetPositionHistory = [];
            this.renderPositionHistory = [];
            this.renderPositionAtPacketHistory = [];
            this.serverPositionHistory = [];
            this.id = od.id;
        }
        update(od) {
            this.copyDefinedProps(od, this, "stats");
            this.lastSeenPacketId = A.game.packetId;
            this.copyDefinedProps(od.stats, this.stats);
        }
        copyDefinedProps(src, dst, ...args) {
            for (let prop in src)
                if (src[prop] !== undefined && args.indexOf(prop) === -1)
                    dst[prop] = src[prop];
        }
    }
    A.Player = Player;
})(A || (A = {}));
var A;
(function (A) {
    class Game {
        constructor() {
            this.visibleArea = { x: -40, y: -22.5, w: 80, h: 45 };
            this.mapArea = { x: -40, y: -22.5, w: 80, h: 45 };
            this.team = 1;
            this.playerId = 0;
            this.players = [];
            this.asteroids = [];
            this.effects = [];
            this.movingEffects = [];
            this.particleSystems = [];
            this.capturePoints = [];
            this.missiles = [];
            this.spaceships = [];
            this.autoPilot = false;
            this.inputAcceleration = new A.Vector2();
            this.packetId = 0;
            this.lastKnownControlledObjectId = 0;
            A.renderer.onRender.add(() => this.onRender());
        }
        getOrCreateObject(list, id, factory) {
            let obj = list.find(x => x.id === id);
            if (!obj)
                list.push(obj = factory());
            return obj;
        }
        onMap(data) {
            A.ServerTime.serverTickInterval = data.serverTickInterval;
            A.ServerTime.serverSendInterval = data.serverSendInterval;
            this.mapArea.x = data.mapArea.X;
            this.mapArea.y = data.mapArea.Y;
            this.mapArea.w = data.mapArea.W;
            this.mapArea.h = data.mapArea.H;
            this.visibleArea.w = data.viewSize.X;
            this.visibleArea.h = data.viewSize.Y;
        }
        onPacket(packet) {
            var _a, _b, _c, _d;
            this.packetId = packet.id;
            A.serverTime.onPacket(packet.serverTicks);
            if (packet.playerId !== undefined)
                this.playerId = packet.playerId;
            let ownTeam = (_b = (_a = this.player) === null || _a === void 0 ? void 0 : _a.team) !== null && _b !== void 0 ? _b : 1;
            A.renderer.setTeam(ownTeam === 2);
            if (packet.players) {
                for (let od of packet.players) {
                    let obj = this.players.find(x => x.id === od.id);
                    if (!obj)
                        this.players.push(obj = new A.Player(od));
                    obj.update(od);
                }
                this.players = this.players.filter(obj => obj.lastSeenPacketId === packet.id);
            }
            this.player = this.players.find(x => x.id === this.playerId);
            this.team = (_d = (_c = A.game.player) === null || _c === void 0 ? void 0 : _c.team) !== null && _d !== void 0 ? _d : 1;
            if (packet.controlledObjId !== undefined)
                this.lastKnownControlledObjectId = packet.controlledObjId;
            this.controlledObject = undefined;
            for (let od of packet.asteroids) {
                let obj = this.getOrCreateObject(this.asteroids, od.id, () => new A.Asteroid(od));
                obj.update(od);
            }
            for (let obj of this.asteroids)
                if (obj.lastSeenPacketId !== packet.id)
                    obj.destroy();
            this.asteroids.removeAll(obj => obj.lastSeenPacketId !== packet.id);
            for (let od of packet.capturePoints) {
                let obj = this.getOrCreateObject(this.capturePoints, od.id, () => new A.CapturePoint(od));
                obj.update(od);
            }
            for (let obj of this.capturePoints)
                if (obj.lastSeenPacketId !== packet.id)
                    obj.destroy();
            this.capturePoints = this.capturePoints.filter(obj => obj.lastSeenPacketId === packet.id);
            for (let od of packet.missiles) {
                let obj = this.getOrCreateObject(this.missiles, od.id, () => new A.Missile(od));
                obj.update(od);
                if (obj.id === this.lastKnownControlledObjectId)
                    this.controlledObject = obj;
            }
            for (let obj of this.missiles)
                if (obj.lastSeenPacketId !== packet.id)
                    obj.destroy();
            this.missiles = this.missiles.filter(obj => obj.lastSeenPacketId === packet.id);
            for (let od of packet.spaceships) {
                let obj = this.getOrCreateObject(this.spaceships, od.id, () => new A.Spaceship(od));
                obj.update(od);
                if (this.lastKnownControlledObjectId === obj.id && this.player && obj.turrets.some(x => x.playerId === this.playerId)) {
                    this.controlledObject = obj;
                    this.player.packetPositionHistory.pushShift(obj.lastKnownP, 20);
                    this.player.renderPositionAtPacketHistory.pushShift(obj.renderPosition, 20);
                    A.debug.updateChart("Render Delta", obj.lastKnownP.sub(obj.renderPosition).len * 100, 0, 100, "u%");
                }
            }
            for (let ship of this.spaceships)
                if (ship.lastSeenPacketId !== packet.id)
                    ship.destroy();
            this.spaceships = this.spaceships.filter(obj => obj.lastSeenPacketId === packet.id);
            for (let od of packet.effects) {
                let obj = this.getOrCreateObject(this.effects, od.id, () => new A.Effect(od));
                obj.update(od);
            }
            for (let obj of this.effects)
                if (obj.lastSeenPacketId !== packet.id)
                    obj.destroy();
            this.effects = this.effects.filter(obj => obj.lastSeenPacketId === packet.id);
            for (let od of packet.movingEffects) {
                let obj = this.getOrCreateObject(this.movingEffects, od.id, () => new A.MovingEffect(od));
                obj.update(od);
            }
            for (let obj of this.movingEffects)
                if (obj.lastSeenPacketId !== packet.id)
                    obj.destroy();
            this.movingEffects = this.movingEffects.filter(obj => obj.lastSeenPacketId === packet.id);
            if (this.autoPilot)
                this.autoPilotControl();
        }
        onRender() {
            A.serverTime.onRender();
            let visibleAreaCenter = null;
            for (let obj of this.asteroids) {
                obj.render();
            }
            for (let obj of this.missiles) {
                obj.render();
                if (this.controlledObject === obj)
                    visibleAreaCenter = obj.renderPosition;
            }
            for (let obj of this.spaceships) {
                obj.render();
                let playerTurret;
                if (this.controlledObject === obj && this.player && (playerTurret = obj.turrets.find(x => x.playerId === this.player.id))) {
                    visibleAreaCenter = obj.renderPosition.add(playerTurret.pos);
                    this.player.serverPositionHistory.pushShift(obj.renderPosition, 240);
                    this.player.renderPositionHistory.pushShift(obj.renderPosition, 240);
                    if (this.particleSystems.length === 0)
                        this.particleSystems.push(new A.ParticleSystem());
                    if (this.inputAcceleration.x !== 0 || this.inputAcceleration.y !== 0) {
                        let a = new A.Vector2(-this.inputAcceleration.x, -this.inputAcceleration.y);
                        this.particleSystems[0].emitterV = a.mul(10).add(obj.clientMotion.velocity);
                        this.particleSystems[0].emitterP = obj.renderPosition;
                        this.particleSystems[0].emitting = true;
                    }
                    else
                        this.particleSystems[0].emitting = false;
                }
            }
            for (let obj of this.movingEffects) {
                let p = obj.serverMotion.getPositionAt(A.serverTime.time);
                obj.renderPosition = obj.clientMotion.step(1 / 60, obj.pid.step(p.sub(obj.clientMotion.position), 1 / 60));
                obj.render();
            }
            for (let obj of this.effects) {
                obj.render();
            }
            if (visibleAreaCenter)
                this.setVisibleAreaCenter(visibleAreaCenter);
        }
        setVisibleAreaCenter(pos) {
            this.visibleArea.x = pos.x - this.visibleArea.w * 0.5;
            this.visibleArea.y = pos.y - this.visibleArea.h * 0.5;
            A.renderer.setCameraTarget(pos);
        }
        autoPilotControl() {
            let obj = this.controlledObject;
            if (!obj)
                return;
        }
    }
    A.Game = Game;
    A.game = new Game();
})(A || (A = {}));
var A;
(function (A) {
    class PureComponent extends preact.Component {
        shouldComponentUpdate(nextProps, nextState) {
            const shallowCompare = (obj1, obj2) => Object.keys(obj1).length === Object.keys(obj2).length &&
                Object.keys(obj1).every(key => obj2.hasOwnProperty(key) && obj1[key] === obj2[key]);
            let identical = shallowCompare(this.props, nextProps) && shallowCompare(this.state, nextState);
            return !identical;
        }
    }
    A.PureComponent = PureComponent;
})(A || (A = {}));
var A;
(function (A) {
    class NotLoggedInWarning extends A.PureComponent {
        constructor() {
            super(...arguments);
            this.timer = 0;
        }
        componentDidMount() {
            this.timer = setTimeout(() => this.props.onClose(), 5000);
        }
        componentWillUnmount() {
            if (this.timer)
                clearTimeout(this.timer);
        }
        render() {
            return (preact.h("div", { class: "notLoggedInWarning" },
                preact.h("h2", null, "This functionality requires a logged in user"),
                preact.h("p", null, "Registering is free; refresh the page to login/register."),
                preact.h("p", null, "You gain access to"),
                preact.h("ul", null,
                    preact.h("li", null, "Different types of spaceships;"),
                    preact.h("li", null, "Upgrades;"),
                    preact.h("li", null, "Achievements;"))));
        }
    }
    A.NotLoggedInWarning = NotLoggedInWarning;
})(A || (A = {}));
var A;
(function (A) {
    class ShipSelection extends A.PureComponent {
        onClick(type) {
            A.connector.SwitchSpaceship(type);
            this.props.onClose();
        }
        render() {
            var _a;
            let shipTypes = A.userMgr.getUsableUnitTypes();
            let currentShipType = (_a = A.game.player) === null || _a === void 0 ? void 0 : _a.spaceshipType;
            return (preact.h("div", { className: "shipSelection", onMouseDown: e => e.stopPropagation() },
                preact.h("p", null, "Choose spaceship type:"),
                preact.h("div", { className: "shipTypes" }, shipTypes.map(x => preact.h("button", { key: x, type: "button", class: "shipCard " + (x === currentShipType ? "active" : "available"), onClick: e => this.onClick(x), disabled: x === currentShipType, title: x === currentShipType ? "You are on this" : "Click to switch to " + x },
                    preact.h("p", null, x))))));
        }
    }
    A.ShipSelection = ShipSelection;
})(A || (A = {}));
var A;
(function (A) {
    class UpgradeCard extends A.PureComponent {
        buy() {
            return __awaiter(this, void 0, void 0, function* () {
                yield A.userMgr.buyUpgrade(this.props.upgrade.id);
                this.props.refresh();
            });
        }
        sell() {
            return __awaiter(this, void 0, void 0, function* () {
                yield A.userMgr.sellUpgrade(this.props.upgrade.id);
                this.props.refresh();
            });
        }
        render() {
            let u = this.props.upgrade;
            let active = u.rank > 0;
            let available = this.props.totalActiveInType >= u.level && u.price <= A.userMgr.user.currentCredit && u.rank < u.maxRank;
            let cls = active ? "active" : available ? "available" : "notAvailable";
            return (preact.h("div", { type: "button", class: "upgradeCard " + cls, title: `${u.name} (${u.price})`, onClick: () => {
                    if (available)
                        this.buy();
                }, onContextMenu: () => {
                    if (active)
                        this.sell();
                } },
                preact.h("div", null)));
        }
    }
    A.UpgradeCard = UpgradeCard;
    class Upgrades extends A.PureComponent {
        onClick(type) {
            this.props.onClose();
        }
        render() {
            var _a;
            let upgrades = A.userMgr.upgrades;
            let columns = [];
            for (let u of upgrades) {
                let col = columns.find(x => x.unitType === u.unitType);
                if (!col)
                    columns.push(col = { unitType: u.unitType, rows: [], totalActive: 0 });
                let row = col.rows[u.level];
                if (!row)
                    col.rows[u.level] = row = [];
                row.push(u);
                col.totalActive += u.rank;
            }
            return (preact.h("div", { className: "upgrades", onMouseDown: e => e.stopPropagation() },
                preact.h("div", { class: "unitTypesContainer" }, columns.map(col => preact.h("div", { class: "unitType" },
                    preact.h("div", { class: "header" },
                        preact.h("h2", null, col.unitType)),
                    col.rows.map(x => preact.h("div", { class: "row" }, x.map(u => preact.h(UpgradeCard, { upgrade: u, totalActiveInType: col.totalActive, refresh: () => this.forceUpdate() }))))))),
                preact.h("p", { class: "credit" },
                    "Current credit: ", (_a = A.userMgr.user) === null || _a === void 0 ? void 0 :
                    _a.currentCredit)));
        }
    }
    A.Upgrades = Upgrades;
})(A || (A = {}));
var A;
(function (A) {
    class RespawnTimer extends A.PureComponent {
        constructor() {
            super(...arguments);
            this.state = { respawnIn: 0 };
        }
        componentDidMount() {
            A.connector.packetEvent.add(p => {
                var _a, _b;
                let respawnIn = ((_b = (_a = A.game.player) === null || _a === void 0 ? void 0 : _a.respawnIn) !== null && _b !== void 0 ? _b : 0) * A.ServerTime.serverTickInterval;
                if (this.state.respawnIn !== respawnIn)
                    this.setState({ respawnIn });
            }, this);
        }
        componentWillUnmount() {
            A.connector.packetEvent.removeAll(this);
        }
        render() {
            return (preact.h("div", { className: "respawnTimer" + (this.state.respawnIn > 0.5 ? " visible" : "") },
                preact.h("div", null,
                    preact.h("p", null, "Respawn in"),
                    preact.h("p", { className: "timer" }, this.state.respawnIn.toFixed(0)),
                    preact.h("p", null, "Press U to choose another spaceship"))));
        }
    }
    A.RespawnTimer = RespawnTimer;
})(A || (A = {}));
var A;
(function (A) {
    class Stats extends A.PureComponent {
        constructor() {
            super(...arguments);
            this.state = { list: [] };
        }
        componentDidMount() {
            A.connector.packetEvent.add(p => {
                if (A.game.players && A.game.players.length > 0)
                    this.setState({ list: A.game.players.filter(x => !x.bot || this.props.showDetails) });
            }, this);
        }
        componentWillUnmount() {
            A.connector.packetEvent.removeAll(this);
        }
        render() {
            let list = this.state.list.sort((a, b) => b.stats.scorePerHour - a.stats.scorePerHour || b.stats.score - a.stats.score ||
                b.stats.kills - a.stats.kills || b.stats.damageDone - a.stats.damageDone ||
                a.stats.deaths - b.stats.deaths || a.stats.damageTaken - b.stats.damageTaken || a.stats.energySpent - b.stats.energySpent);
            let selfN = list.findIndex(x => x.id === A.game.playerId);
            let team = selfN >= 0 ? list[selfN].team : 1;
            const n = 10;
            if (list.length === 0)
                return false;
            return (preact.h("div", { className: "stats" },
                preact.h("table", null,
                    this.props.showDetails &&
                        preact.h("thead", null,
                            preact.h("tr", null,
                                this.props.showDetails && preact.h("th", null, "Rank"),
                                preact.h("th", null, "Name"),
                                preact.h("th", null, "Score"),
                                this.props.showDetails &&
                                    [
                                        preact.h("th", null, "Ship"),
                                        preact.h("th", null, "Kills"),
                                        preact.h("th", null, "Deaths"),
                                        preact.h("th", null,
                                            "Damage",
                                            preact.h("br", null),
                                            "Done"),
                                        preact.h("th", null,
                                            "Damage",
                                            preact.h("br", null),
                                            "Taken"),
                                        preact.h("th", null,
                                            "Healing",
                                            preact.h("br", null),
                                            "Done"),
                                        preact.h("th", null,
                                            "Energy",
                                            preact.h("br", null),
                                            "Restored")
                                    ])),
                    preact.h("tbody", null, list.map((p, i) => i < n || i > selfN - 3 && i < selfN + 3 ?
                        preact.h("tr", { key: p.id, className: p.id === A.game.playerId ? "self" : p.team === team ? "homeTeam" : "enemyTeam" },
                            this.props.showDetails && preact.h("td", null, i + 1),
                            preact.h("td", null, p.name),
                            preact.h("td", null,
                                p.stats.score,
                                " (",
                                p.stats.scorePerHour,
                                "/h)"),
                            this.props.showDetails &&
                                [
                                    preact.h("td", null, p.spaceshipType),
                                    preact.h("td", null, p.stats.kills),
                                    preact.h("td", null, p.stats.deaths),
                                    preact.h("td", null, p.stats.damageDone),
                                    preact.h("td", null, p.stats.damageTaken),
                                    preact.h("td", null, p.stats.healingDone),
                                    preact.h("td", null, p.stats.energyRestored)
                                ]) :
                        i === n && selfN > n + 5 && preact.h("tr", { key: i },
                            preact.h("td", null, "...")))))));
        }
    }
    A.Stats = Stats;
})(A || (A = {}));
var A;
(function (A) {
    class MiniChart extends preact.Component {
        render() {
            var _a, _b, _c;
            let aspectRatio = 2;
            let height = 100;
            let width = height * aspectRatio;
            let data = this.props.data;
            let step = width / (data.length - 1);
            let scale = (height / (this.props.max - this.props.min));
            let ymin = this.props.min * scale;
            let pattern = "";
            if (data.length >= 1) {
                let y = Math.floor(ymin + height - data[0] * scale);
                pattern += "M0.0 " + (Math.floor(y) + 0.5) + (data.length > 1 ? "L" : "");
                for (let i = 1; i < data.length; i++) {
                    let y = Math.floor(ymin + height - data[i] * scale);
                    let x = step * i;
                    pattern += (Math.floor(x) + 0.5) + " " + (Math.floor(y) + 0.5) + " ";
                }
            }
            return (preact.h("svg", { viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: "none" },
                preact.h("path", { stroke: (_a = this.props.lineColor) !== null && _a !== void 0 ? _a : "black", strokeWidth: (_b = this.props.lineThickness) !== null && _b !== void 0 ? _b : 1, fill: "none", d: pattern }),
                this.props.fill && data.length >= 2 && preact.h("path", { stroke: "none", fill: (_c = this.props.lineColor) !== null && _c !== void 0 ? _c : "black", fillOpacity: "0.25", d: `${pattern}${width} ${height} 0 ${height} Z` })));
        }
    }
    A.MiniChart = MiniChart;
})(A || (A = {}));
var A;
(function (A) {
    class Debug extends A.PureComponent {
        componentDidMount() {
            A.connector.packetEvent.add(p => {
                this.forceUpdate();
            }, this);
        }
        componentWillUnmount() {
            A.connector.packetEvent.removeAll(this);
        }
        render() {
            let colors = ["blue", "green", "yellow", "red", "lime", "orange", "purple"];
            let text = `${A.renderer.width}x${A.renderer.height} (${document.body.clientWidth}x${document.body.clientHeight}) @${Math.round(A.renderer.debugNumbers["FPS"])} fps; ${Math.round(A.renderer.debugNumbers["Frame Time"])} ms`;
            return (preact.h("div", { className: "debug" },
                preact.h("p", null, text),
                this.props.showDetails &&
                    preact.h("div", { className: "charts" }, A.debug.charts.map((x, i) => preact.h("div", { className: "chart", key: x.name },
                        preact.h("div", { className: "header" },
                            preact.h("p", null, x.name),
                            preact.h("p", null,
                                Math.round(x.values[x.values.length - 1]),
                                " ",
                                x.unit)),
                        preact.h("div", null,
                            preact.h(A.MiniChart, { data: x.values, min: x.min, max: x.max, lineColor: colors[i], fill: true })))))));
        }
    }
    A.Debug = Debug;
})(A || (A = {}));
var A;
(function (A) {
    ;
    class SimpleInput extends A.PureComponent {
        constructor() {
            super(...arguments);
            this.inputRef = preact.createRef();
        }
        componentDidMount() {
            var _a;
            if (this.props.autofocus)
                (_a = this.inputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
        render() {
            var _a;
            let attrs = {};
            if (this.props.placeholder)
                attrs.placeholder = this.props.placeholder;
            if (this.props.autofocus)
                attrs.autoFocus = true;
            if (this.props.onEnter || this.props.onEsc)
                attrs.onKeyDown = e => {
                    if (e.keyCode === 13 && this.props.onEnter)
                        this.props.onEnter();
                    else if (e.keyCode === 27 && this.props.onEsc)
                        this.props.onEsc();
                };
            if (this.props.onBlur)
                attrs.onBlur = this.props.onBlur;
            return (preact.h("input", Object.assign({ ref: this.inputRef, type: (_a = this.props.type) !== null && _a !== void 0 ? _a : "text", value: this.props.value, onInput: e => { var _a, _b; return (_b = (_a = this.props).onChange) === null || _b === void 0 ? void 0 : _b.call(_a, e.target.value); } }, attrs)));
        }
    }
    A.SimpleInput = SimpleInput;
})(A || (A = {}));
var A;
(function (A) {
    class Chat extends A.PureComponent {
        constructor() {
            super(...arguments);
            this.state = { messages: [], text: "" };
            this.typeClass = ["server", "game", "team", "whisper"];
        }
        onEnter() {
            let cmd;
            if (this.state.text) {
                if (this.state.text[0] === "/")
                    cmd = this.state.text.substr(1);
                else
                    A.connector.SendChatMessage(0, this.state.text);
            }
            this.closeInput(cmd);
        }
        closeInput(cmd) {
            this.setState({ text: "" });
            this.props.onCloseInput(cmd);
        }
        componentDidMount() {
            A.connector.packetEvent.add(p => {
                let messages = this.state.messages;
                let dirty = false;
                if (p.chatMessage) {
                    messages.pushShift(p.chatMessage, 10);
                    dirty = true;
                }
                if (messages.length > 0 && Date.now() > messages[0].time + 60000) {
                    dirty = true;
                    messages.shift();
                }
                if (dirty) {
                    this.setState({ messages });
                    this.forceUpdate();
                }
            }, this);
        }
        componentWillUnmount() {
            A.connector.packetEvent.removeAll(this);
        }
        render() {
            return (preact.h("div", { className: "chat" },
                preact.h("div", { className: "messages" }, this.state.messages.map(x => {
                    var _a;
                    return preact.h("p", { key: x.time, className: (x.from ? "fromPlayer " : "fromServer ") + this.typeClass[x.type] },
                        preact.h("span", { className: "time" }, new Date(x.time).toLocaleTimeString()),
                        !!x.from && preact.h("span", { className: "from" }, (_a = A.game.players.find(p => p.id === x.from)) === null || _a === void 0 ? void 0 :
                            _a.name,
                            ":"),
                        preact.h("span", { className: "text" }, x.text));
                })),
                this.props.inputVisible &&
                    preact.h(A.SimpleInput, { placeholder: "Type something here...", autofocus: true, value: this.state.text, onChange: e => this.setState({ text: e }), onEnter: () => this.onEnter(), onEsc: () => this.closeInput(), onBlur: () => this.closeInput() })));
        }
    }
    A.Chat = Chat;
})(A || (A = {}));
var A;
(function (A) {
    class Joystick extends A.PureComponent {
        clamp(x, a, b) {
            return x < a ? a : x > b ? b : x;
        }
        render() {
            let size = 50;
            let jx = this.props.coords.jx - this.props.coords.x;
            let jy = this.props.coords.jy - this.props.coords.y;
            if (jx * jx + jy * jy > size * size) {
                let s = size / Math.sqrt(jx * jx + jy * jy);
                jx *= s;
                jy *= s;
            }
            jx += size;
            jy += size;
            return (preact.h("div", { className: "joystick", style: { top: this.props.coords.y, left: this.props.coords.x } },
                preact.h("div", { style: { top: jy, left: jx } })));
        }
    }
    A.Joystick = Joystick;
})(A || (A = {}));
var A;
(function (A) {
    ;
    class Switch extends A.PureComponent {
        constructor() {
            super(...arguments);
            this.state = { value: this.props.value };
        }
        render() {
            return (preact.h("label", { className: "switch" },
                preact.h("input", { type: "checkbox", checked: this.state.value, onChange: e => {
                        var _a, _b;
                        this.setState({ value: e.target.checked });
                        (_b = (_a = this.props).onChange) === null || _b === void 0 ? void 0 : _b.call(_a, e.target.checked);
                    } }),
                preact.h("span", { className: "slider" }),
                preact.h("span", { className: "label" }, this.props.label)));
        }
    }
    A.Switch = Switch;
})(A || (A = {}));
var A;
(function (A) {
    ;
    class CheckBox extends A.PureComponent {
        constructor() {
            super(...arguments);
            this.state = { value: this.props.value };
        }
        render() {
            let attrs = { type: "checkbox" };
            if (this.props.autofocus)
                attrs.autoFocus = true;
            if (this.props.onEnter)
                attrs.onKeyDown = e => {
                    if (e.keyCode === 13)
                        this.props.onEnter();
                };
            return (preact.h("label", { className: "checkbox" },
                preact.h("input", Object.assign({ checked: this.state.value, onChange: e => {
                        var _a, _b;
                        this.setState({ value: e.target.checked });
                        (_b = (_a = this.props).onChange) === null || _b === void 0 ? void 0 : _b.call(_a, e.target.checked);
                    } }, attrs)),
                preact.h("span", null, this.props.label)));
        }
    }
    A.CheckBox = CheckBox;
})(A || (A = {}));
var A;
(function (A) {
    class Login extends A.PureComponent {
        constructor() {
            var _a;
            super(...arguments);
            this.state = {
                name: (_a = localStorage["name"]) !== null && _a !== void 0 ? _a : "",
                proMode: localStorage["proMode"] === "true",
                loggedIn: false,
                register: true,
                userName: "",
                password: "",
                fullName: "",
                stayLoggedIn: true,
                errorMessage: ""
            };
        }
        componentDidMount() {
            A.connector.userEvent.add(() => this.setState({ loggedIn: A.userMgr.loggedIn }), this);
        }
        componentWillUnmount() {
            A.connector.userEvent.removeAll(this);
        }
        proModeChange(checked) {
            localStorage["proMode"] = checked.toString();
            if (!checked)
                A.connector.Logout();
            this.setState({ proMode: checked });
        }
        onJoin() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.state.proMode && !this.state.loggedIn) {
                    if (this.state.register) {
                        let ret = yield A.connector.Register(this.state.userName, this.state.password, this.state.fullName);
                        if (ret) {
                            this.setState({ errorMessage: ret });
                            return;
                        }
                    }
                    let ret = yield A.connector.Login(this.state.userName, this.state.password, this.state.stayLoggedIn);
                    if (ret) {
                        this.setState({ errorMessage: ret });
                        return;
                    }
                }
                A.connector.CreatePlayer(this.state.name);
                this.props.onLogin();
            });
        }
        render() {
            var _a;
            return (preact.h("div", { className: "login" },
                preact.h("h1", null, "AsteroFight"),
                preact.h("input", { type: "text", placeholder: "Name", value: this.state.name, onChange: x => {
                        localStorage["name"] = x.target.value;
                        this.setState({ name: x.target.value });
                    }, onKeyDown: e => {
                        if (e.keyCode === 13)
                            this.onJoin();
                    }, className: "displayName", autoFocus: true }),
                preact.h(A.Switch, { label: "Pro Mode", value: this.state.proMode, onChange: x => this.proModeChange(x) }),
                this.state.proMode &&
                    (this.state.loggedIn ?
                        preact.h("p", null,
                            "You are logged in as ", (_a = A.userMgr.user) === null || _a === void 0 ? void 0 :
                            _a.name) :
                        preact.h("div", { class: "fields" },
                            preact.h("p", null, "Log in to upgrade ships"),
                            preact.h("input", { type: "text", value: this.state.userName, onChange: x => this.setState({ userName: x.target.value }), placeholder: "Email", onKeyDown: e => {
                                    if (e.keyCode === 13)
                                        this.onJoin();
                                } }),
                            preact.h("input", { type: "password", value: this.state.password, onChange: x => this.setState({ password: x.target.value }), placeholder: "Password", onKeyDown: e => {
                                    if (e.keyCode === 13)
                                        this.onJoin();
                                } }),
                            this.state.register &&
                                preact.h("input", { type: "text", value: this.state.fullName, onChange: x => this.setState({ fullName: x.target.value }), placeholder: "Full Name", onKeyDown: e => {
                                        if (e.keyCode === 13)
                                            this.onJoin();
                                    } }),
                            preact.h(A.CheckBox, { label: "Stay logged in", value: this.state.stayLoggedIn, onChange: (checked) => this.setState({ stayLoggedIn: checked }) }),
                            this.state.register ?
                                preact.h("p", null,
                                    "Already have an account? Switch to",
                                    preact.h("a", { onClick: () => this.setState({ register: false }) }, "Login")) :
                                preact.h("p", null,
                                    "Have no account yet? Switch to",
                                    preact.h("a", { onClick: () => this.setState({ register: true }) }, "Register")))),
                preact.h("button", { type: "button", onClick: () => this.onJoin() }, !this.state.proMode || this.state.loggedIn ? "Join" : this.state.register ? "Register" : "Login"),
                preact.h("p", { class: "error" }, this.state.errorMessage),
                preact.h("div", null,
                    preact.h("a", { href: "Site/rules.html" }, "Rules"),
                    preact.h("a", { href: "Site/credits.html" }, "Credits"),
                    preact.h("a", { href: "Site/join.html" }, "Join Us"),
                    preact.h("a", { href: "Site/privacy.html" }, "Privacy Policy"))));
        }
    }
    A.Login = Login;
})(A || (A = {}));
var A;
(function (A) {
    class Menu extends A.PureComponent {
        constructor() {
            super(...arguments);
            this.state = { loggedIn: false, userName: "", password: "", stayLoggedIn: true };
        }
        onClick() {
        }
        onLoginRegister() {
        }
        render() {
            return (preact.h("div", { className: "menu" },
                preact.h("button", { type: "button", className: "icon", onClick: () => this.props.onVisibleChange() }, "\u2630"),
                this.props.visible &&
                    preact.h("div", { className: "dropdown" },
                        preact.h("h2", null, "AsteroFight"),
                        this.state.loggedIn ?
                            preact.h("button", { type: "button", className: "menuitem" }, "Logout") :
                            preact.h("div", null,
                                preact.h("button", { type: "button", className: "menuitem" }, "Login"),
                                preact.h("button", { type: "button", className: "menuitem" }, "Register")))));
        }
    }
    A.Menu = Menu;
})(A || (A = {}));
var A;
(function (A) {
    class App extends A.PureComponent {
        constructor() {
            super(...arguments);
            this.state = {
                notLoggedInWarningVisible: false,
                chatInputVisible: false,
                joystick: null,
                loginVisible: true,
                statsVisible: false,
                shipSelectionVisible: false,
                upgradesVisible: false,
                debugVisible: !document.location.hostname,
                menuVisible: true
            };
            this.left = false;
            this.up = false;
            this.right = false;
            this.down = false;
            this.aX = 0;
            this.aY = 0;
            this.mouseX = 0;
            this.mouseY = 0;
            this.mouseDownX = 0;
            this.mouseDownY = 0;
            this.lastKeyDown = 0;
            this.timer = 0;
            this.lastSend = 0;
        }
        onKey(e, pressed) {
            if (e.keyCode === 13 && pressed) {
                this.setState({ chatInputVisible: true });
            }
            else if (e.key === '/' && pressed) {
                this.setState({ chatInputVisible: true });
            }
            else if (pressed && e.keyCode === 84) {
                this.setState({ statsVisible: !this.state.statsVisible });
            }
            else if (pressed && e.keyCode === 85) {
                if (A.userMgr.loggedIn)
                    this.setState({ shipSelectionVisible: !this.state.shipSelectionVisible });
                else
                    this.setState({ notLoggedInWarningVisible: !this.state.notLoggedInWarningVisible });
            }
            else if (pressed && e.keyCode === 78) {
                if (A.userMgr.loggedIn)
                    this.setState({ upgradesVisible: !this.state.upgradesVisible });
                else
                    this.setState({ notLoggedInWarningVisible: !this.state.notLoggedInWarningVisible });
            }
            else if (pressed && e.keyCode === 27) {
                this.setState({ statsVisible: false, shipSelectionVisible: false, upgradesVisible: false, notLoggedInWarningVisible: false });
            }
            else {
                if (!A.game.player)
                    return;
                if ((e.keyCode >= 37 && e.keyCode <= 40 || e.keyCode === 87 || e.keyCode === 65 || e.keyCode === 83 || e.keyCode === 68)) {
                    if (e.keyCode === 37 || e.keyCode === 65)
                        this.left = pressed;
                    if (e.keyCode === 38 || e.keyCode === 87)
                        this.up = pressed;
                    if (e.keyCode === 39 || e.keyCode === 68)
                        this.right = pressed;
                    if (e.keyCode === 40 || e.keyCode === 83)
                        this.down = pressed;
                    this.aX = (this.left ? -1 : 0) + (this.right ? 1 : 0);
                    this.aY = (this.up ? 1 : 0) + (this.down ? -1 : 0);
                    A.game.autoPilot = false;
                    this.control();
                }
                else if (pressed && e.keyCode === 81) {
                    A.connector.Use(0, 0, 3);
                }
                else if (pressed && e.keyCode === 32) {
                    A.game.autoPilot = true;
                }
            }
        }
        control(forceSend) {
            let now = performance.now();
            let timeSinceLastSend = now - this.lastSend;
            if (forceSend || timeSinceLastSend > 200 && !this.timer) {
                this.lastSend = now;
                if (this.timer) {
                    window.clearTimeout(this.timer);
                    this.timer = 0;
                }
                A.connector.Control(!A.renderer.orientationRightToLeft && !A.renderer.orientationPortrait ? this.aX :
                    A.renderer.orientationRightToLeft && !A.renderer.orientationPortrait ? -this.aX :
                        !A.renderer.orientationRightToLeft && A.renderer.orientationPortrait ? this.aY :
                            -this.aY, !A.renderer.orientationRightToLeft && !A.renderer.orientationPortrait ? this.aY :
                    A.renderer.orientationRightToLeft && !A.renderer.orientationPortrait ? -this.aY :
                        !A.renderer.orientationRightToLeft && A.renderer.orientationPortrait ? -this.aX :
                            this.aX);
            }
            else if (!this.timer)
                this.timer = window.setTimeout(() => {
                    this.timer = 0;
                    this.control(true);
                }, 200 - timeSinceLastSend);
        }
        componentDidMount() {
            window.addEventListener("keydown", e => this.onKeyDown(e));
            window.addEventListener("keyup", e => this.onKeyUp(e));
            window.addEventListener("mousedown", e => this.onMouseDown(e));
            window.addEventListener("mouseup", e => this.onMouseUp(e));
            window.addEventListener("mousemove", e => this.onMouseMove(e));
            window.addEventListener("contextmenu", e => {
                e.preventDefault();
                return false;
            });
        }
        onKeyDown(e) {
            if (this.shouldIgnoreKey(e) || this.lastKeyDown === e.keyCode)
                return;
            this.lastKeyDown = e.keyCode;
            this.onKey(e, true);
        }
        onKeyUp(e) {
            if (this.shouldIgnoreKey(e))
                return;
            this.lastKeyDown = 0;
            this.onKey(e, false);
        }
        shouldIgnoreKey(e) {
            return e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLButtonElement && (e.keyCode === 27 || e.keyCode === 32 || e.keyCode === 9);
        }
        onMouseDown(e) {
            if (e.button === 0) {
                let pos = A.renderer.getGameCoords(e.clientX, e.clientY);
                A.connector.Use(pos.x, pos.y, 1);
            }
            else if (e.button === 1) {
                this.setState({
                    joystick: {
                        x: this.mouseDownX = e.clientX,
                        y: this.mouseDownY = e.clientY,
                        jx: e.clientX,
                        jy: e.clientY
                    }
                });
            }
            else if (e.button === 2) {
                e.preventDefault();
                let pos = A.renderer.getGameCoords(e.clientX, e.clientY);
                A.connector.Use(pos.x, pos.y, 2);
            }
        }
        onMouseMove(e) {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            if (e.buttons === 4)
                this.setState({ joystick: { x: this.mouseDownX, y: this.mouseDownY, jx: e.clientX, jy: e.clientY } });
        }
        onMouseUp(e) {
            if (e.button === 1)
                this.setState({ joystick: null });
        }
        processCommand(cmd) {
            this.setState({ chatInputVisible: false });
            if (cmd === "swap")
                A.connector.SwapTeam();
            else if (cmd === "dbg")
                this.setState({ debugVisible: !this.state.debugVisible });
        }
        render() {
            return [
                this.state.notLoggedInWarningVisible && preact.h(A.NotLoggedInWarning, { onClose: () => this.setState({ notLoggedInWarningVisible: false }) }),
                this.state.upgradesVisible && preact.h(A.Upgrades, { onClose: () => this.setState({ upgradesVisible: false }) }),
                this.state.shipSelectionVisible && preact.h(A.ShipSelection, { onClose: () => this.setState({ shipSelectionVisible: false }) }),
                preact.h(A.Debug, { showDetails: this.state.debugVisible }),
                preact.h(A.Stats, { showDetails: this.state.statsVisible }),
                preact.h(A.Chat, { inputVisible: this.state.chatInputVisible, onCloseInput: x => this.processCommand(x) }),
                this.state.joystick && preact.h(A.Joystick, { coords: this.state.joystick }),
                preact.h(A.RespawnTimer, null),
                this.state.loginVisible && preact.h(A.Login, { onLogin: () => this.setState({ loginVisible: false }) })
            ];
        }
    }
    A.App = App;
})(A || (A = {}));
var A;
(function (A) {
    preact.render(preact.h(A.App, null), document.querySelector("main"));
    console.log(A.connector.test());
})(A || (A = {}));
//# sourceMappingURL=app.js.map