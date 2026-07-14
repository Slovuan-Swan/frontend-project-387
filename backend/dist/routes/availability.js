"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const availability_1 = require("../availability");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    const { eventTypeId, from, to } = req.query;
    if (!eventTypeId) {
        return res.status(400).json({ code: 'validation_error', message: 'eventTypeId is required' });
    }
    const slots = (0, availability_1.generateAvailableSlots)(eventTypeId, from, to);
    res.json(slots);
});
exports.default = router;
