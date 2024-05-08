const winston = require('winston');
const mongoose = require('mongoose');
const config = require('config');
module.exports = async function () {
	const db = config.get("db");

	mongoose.connect(db).then(() => {
		console.log('Database Connected');
	})
		.catch((error) => {
			console.error('Database Connection Error:', error);
		});

}