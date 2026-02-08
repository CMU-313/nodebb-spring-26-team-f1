'use strict';

const db = require('../../database');

module.exports = {
	name: 'Add topic resolution status fields (isResolved, resolvedAt, resolvedBy)',
	timestamp: Date.UTC(2026, 1, 5),
	method: async function () {
		const topics = await db.getSortedSetRange('topics:tid', 0, -1);
		
		if (!topics || topics.length === 0) {
			return;
		}

		// Initialize resolution fields for all existing topics in batches
		const batchSize = 1000;
		for (let i = 0; i < topics.length; i += batchSize) {
			const batch = topics.slice(i, i + batchSize);
			await Promise.all(batch.map(tid => db.setObject(`topic:${tid}`, {
				isResolved: 0,
				resolvedAt: null,
				resolvedBy: null,
			})));
		}
	},
};
