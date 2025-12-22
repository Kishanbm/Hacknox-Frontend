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
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidation = exports.signupValidation = exports.validate = void 0;
const express_validator_1 = require("express-validator");
// Middleware to check validation results and halt if errors exist
const validate = (validations) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        yield Promise.all(validations.map(validation => validation.run(req)));
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next();
        }
        // Return only the first error for cleaner responses
        const firstError = errors.array()[0];
        // express-validator's ValidationError may have different shapes depending on versions
        // Safely extract the field name using a type-guard fallback
        const field = (_c = (_b = (_a = firstError.param) !== null && _a !== void 0 ? _a : firstError.path) !== null && _b !== void 0 ? _b : firstError.location) !== null && _c !== void 0 ? _c : null;
        res.status(400).json({
            message: 'Validation failed',
            error: firstError.msg,
            field
        });
    });
};
exports.validate = validate;
// --- Validation Schemas ---
exports.signupValidation = [
    (0, express_validator_1.body)('firstName').trim().notEmpty().withMessage('First name is required.'),
    (0, express_validator_1.body)('lastName').trim().notEmpty().withMessage('Last name is required.'),
    (0, express_validator_1.body)('email').isEmail().withMessage('A valid email address is required.'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
        .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter.')
        .matches(/[a-z]/).withMessage('Password must contain a lowercase letter.')
        .matches(/[0-9]/).withMessage('Password must contain a number.')
];
exports.loginValidation = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required.'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password cannot be empty.')
];
