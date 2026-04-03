/* eslint-disable strict */
//var request = require('request');

const translatorApi = module.exports;

translatorApi.translate = async function (postData) {
	const TRANSLATOR_API = process.env.TRANSLATOR_API || 'http://127.0.0.1:5000';
	try {
		const response = await fetch(TRANSLATOR_API + '/?content=' + encodeURIComponent(postData.content));
		const data = await response.json();
		return [data.is_english, data.translated_content];
	} catch (e) {
		console.error('Translation service error:', e);
		return [true, postData.content];
	}
};