"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_1 = require("../store");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.json(store_1.eventTypes);
});
router.post('/', (req, res) => {
    const { id, title, description, durationMinutes } = req.body;
    if (!id || !title || !description || durationMinutes === undefined) {
        return res.status(400).json({ code: 'validation_error', message: 'Missing required fields' });
    }
    if ((0, store_1.findEventType)(id)) {
        return res.status(400).json({ code: 'validation_error', message: 'Event type with this id already exists' });
    }
    const newEvent = { id, title, description, durationMinutes };
    (0, store_1.addEventType)(newEvent);
    res.status(200).json(newEvent);
});
router.get('/:id', (req, res) => {
    const et = (0, store_1.findEventType)(req.params.id);
    if (!et) {
        return res.status(404).json({ code: 'not_found', message: 'Event type not found' });
    }
    res.json(et);
});
router.patch('/:id', (req, res) => {
    const et = (0, store_1.findEventType)(req.params.id);
    if (!et) {
        return res.status(404).json({ code: 'not_found', message: 'Event type not found' });
    }
    const { title, description, durationMinutes } = req.body;
    const updated = (0, store_1.updateEventType)(req.params.id, { title, description, durationMinutes });
    res.json(updated);
});
router.delete('/:id', (req, res) => {
    const deleted = (0, store_1.deleteEventType)(req.params.id);
    if (!deleted) {
        return res.status(404).json({ code: 'not_found', message: 'Event type not found' });
    }
    res.status(204).send();
});
exports.default = router;
