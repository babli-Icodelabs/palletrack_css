const { algoliasearch } = require('algoliasearch');

const appId = process.env.ALGOLIA_APP_ID;
const adminKey = process.env.ALGOLIA_ADMIN_API_KEY;

if (!appId || !adminKey) {
    console.warn('Algolia credentials not set. Set ALGOLIA_APP_ID and ALGOLIA_ADMIN_API_KEY in .env');
}

const client = algoliasearch(appId, adminKey);

/**
 * Helper to get index instance (fallback to default env index)
 * @param {string} indexName
 */
function getIndex(indexName) {
    const idx = indexName || process.env.ALGOLIA_DEFAULT_INDEX;
    if (!idx) throw new Error('Index name is required (pass indexName in request body or set DEFAULT_INDEX)');
    return client.initIndex(idx);
}

module.exports = {
    saveObjects: async (indexName, objects) => {
        const index = getIndex(indexName);
        return index.saveObjects(objects); // expects objects with objectID or objectID will be generated
    },

    getObject: async (indexName, objectID) => {
        const index = getIndex(indexName);
        return index.getObject(objectID);
    },

    partialUpdateObject: async (indexName, objectID, partialObject) => {
        const index = getIndex(indexName);
        // partialUpdateObject must include objectID
        return index.partialUpdateObject({ objectID, ...partialObject }, { createIfNotExists: false });
    },

    deleteObject: async (indexName, objectID) => {
        const index = getIndex(indexName);
        return index.deleteObject(objectID);
    },

    search: async (indexName, params) => {
        const index = getIndex(indexName);
        // params can include query, filters, hitsPerPage, page, facetFilters etc.
        return index.search(params.query || '', params);
    },

    deleteBy: async (indexName, filters) => {
        const index = getIndex(indexName);
        // filters is an Algolia filter string
        return index.deleteBy({ filters });
    },

    clearIndex: async (indexName) => {
        const index = getIndex(indexName);
        return index.clearObjects();
    },
};
