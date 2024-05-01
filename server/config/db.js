const mongoose = require('mongoose');
const mongooseDB = process.env.MONGO_URI;
const connectDB = async () => {
	try {
		await mongoose.connect(mongooseDB);
		console.log('MongoDB...connection established. Success!');
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};
const Post = require('../models/Post');
function insertPostData() {
	Post.insertMany([
		{
			title: 'Post One',
			body: 'This is the first post we will be adding.',
		},
		{
			title: 'Post Two',
			body: 'This is another post we will be including in our database.',
		},
	]);
}
module.exports = connectDB;
