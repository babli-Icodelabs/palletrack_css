// controllers/algoliaController.js
const algolia = require('../services/algoliaService');

// centralized responder
const safeRespond = async (res, fn) => {
    try {
        const data = await fn;
        res.json({ success: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: err.message || String(err),
        });
    }
};

module.exports = {
    saveObjects: (req, res) => {
        const { indexName, objects } = req.body || {};
        if (!Array.isArray(objects)) {
            return res.status(400).json({ success: false, error: 'objects must be an array' });
        }
        safeRespond(res, algolia.saveObjects(indexName, objects));
    },

    getObject: (req, res) => {
        const { indexName } = req.query;
        const { objectID } = req.params;
        if (!objectID) {
            return res.status(400).json({ success: false, error: 'objectID required' });
        }
        safeRespond(res, algolia.getObject(indexName, objectID));
    },

    partialUpdate: (req, res) => {
        const { indexName, partial = req.body.partial || req.body } = req.body || {};
        const { objectID } = req.params;
        if (!objectID || !partial) {
            return res.status(400).json({ success: false, error: 'objectID and partial data required' });
        }
        safeRespond(res, algolia.partialUpdateObject(indexName, objectID, partial));
    },

    deleteObject: (req, res) => {
        const { indexName } = req.query;
        const { objectID } = req.params;
        if (!objectID) {
            return res.status(400).json({ success: false, error: 'objectID required' });
        }
        safeRespond(res, algolia.deleteObject(indexName, objectID));
    },

    search: (req, res) => {
        const { indexName, ...params } = req.body || {};
        if (!indexName) {
            return res.status(400).json({ success: false, error: 'indexName required' });
        }
        safeRespond(res, algolia.search(indexName, params));
    },

    deleteBy: (req, res) => {
        const { indexName, filters } = req.body || {};
        if (!filters) {
            return res.status(400).json({ success: false, error: 'filters required for deleteBy' });
        }
        safeRespond(res, algolia.deleteBy(indexName, filters));
    },

    clearIndex: (req, res) => {
        const { indexName } = req.body || {};
        const targetIndex = indexName || process.env.DEFAULT_INDEX;
        if (!targetIndex) {
            return res.status(400).json({ success: false, error: 'indexName required' });
        }
        safeRespond(res, algolia.clearIndex(targetIndex));
    },
};
