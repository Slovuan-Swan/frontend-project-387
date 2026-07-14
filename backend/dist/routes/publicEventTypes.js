"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_1 = require("../store");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.json(store_1.eventTypes);
});
router.get('/:id', (req, res) => {
    const et = (0, store_1.findEventType)(req.params.id);
    if (!et) {
        return res.status(404).json({ code: 'not_found', message: 'Event type not found' });
    }
    res.json(et);
});
exports.default = router;
