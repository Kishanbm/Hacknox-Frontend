"use strict";
// File utilities
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExtension = getExtension;
function getExtension(name) {
    const i = name.lastIndexOf(".");
    return i >= 0 ? name.slice(i).toLowerCase() : "";
}
exports.default = { getExtension };
