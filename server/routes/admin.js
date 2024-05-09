const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const adminLayout = '../views/layouts/admin';

/*
 * CHECK LOGIN MIDDLEWARE
 */
const authMiddleware = (req, res, next) => {
	const token = req.cookies.token;
	if (!token) {
		return res.status(401).json({message: 'Unauthorized'});
	}
	try {
		const decoded = jwt.verify(token, jwtSecret);
		req.userId = decoded.userId;
		next();
	} catch (error) {
		return res.status(401).json({message: 'Unauthorized'});
	}
};

/*
 * GET /
 * ADMIN - CHECK LOGIN
 */
router.get('/admin', async (req, res) => {
	try {
		const locals = {
			title: 'Admin',
			description: 'A blog template made with NodeJS and ExpressJS',
		};
		res.render('admin/index', {locals, layout: adminLayout});
	} catch (error) {
		console.log(error);
	}
});

/*
 * POST /LOGIN
 * ADMIN - LOGIN ACCOUNT
 */
router.post('/admin', async (req, res) => {
	try {
		const {username, password} = req.body;
		const user = await User.findOne({username});
		if (!user) {
			return res.status(401).json({message: 'Invalid Credentials'});
		}
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({message: 'Invalid Credentials'});
		}
		const token = jwt.sign({userId: user._id}, jwtSecret);
		res.cookie('token', token, {httpOnly: true});
		res.redirect('/dashboard');
	} catch (error) {
		console.log(error);
	}
});

/*
 * GET /DASHBOARDD
 * ADMIN - DASHBOARD
 */
router.get('/dashboard', authMiddleware, async (req, res) => {
	try {
		const locals = {
			title: 'Dashboard',
			description: 'A blog template made with NodeJS and ExpressJS',
		};
		const data = await Post.find();
		res.render('admin/dashboard', {locals, data, layout: adminLayout});
	} catch (error) {}
});

/*
 * POST /REGISTER
 * ADMIN - REGISTER ACCOUNT
 */
router.post('/register', async (req, res) => {
	try {
		const {username, password} = req.body;
		const hashedPassword = await bcrypt.hash(password, 10);
		try {
			const user = await User.create({
				username,
				password: hashedPassword,
			});
			res.status(201).json({message: 'User created successfully', user});
		} catch (error) {
			if (error === 11000) {
				return res.status(500).json({message: 'User already exists!'});
			} else {
				return res
					.status(500)
					.json({message: 'Something went wrong with the server!'});
			}
		}
	} catch {
		console.log(error);
	}
});

/*
 * GET /LOGOUT
 * ADMIN - LOGOUT
 */
router.get('/logout', authMiddleware, async (req, res) => {
	try {
		res.clearCookie('token');
		res.redirect('/');
	} catch (error) {
		console.log(error);
	}
});

/*
 * GET /ADD-POST
 * ADMIN - CREATE NEW POST
 */
router.get('/add-post', authMiddleware, async (req, res) => {
	try {
		const locals = {
			title: 'Create Post',
			description: 'A blog template made with NodeJS, ExpressJS, and EJS',
		};
		const data = await Post.find();
		res.render('admin/add-post', {locals, data, layout: adminLayout});
	} catch (error) {
		console.log(error);
	}
});

/*
 * POST /ADD-POST
 * ADMIN - CREATE NEW POST
 */
router.post('/add-post/', authMiddleware, async (req, res) => {
	try {
		console.log(req.body);
		try {
			const newPost = new Post({
				title: req.body.title,
				body: req.body.body,
			});
			await Post.create(newPost);
			res.redirect('/dashboard');
		} catch (error) {
			console.log(error);
		}
	} catch (error) {
		console.log(error);
	}
});

/*
 * GET /EDIT-POST
 * ADMIN - UPDATE POST
 */
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
	try {
		const locals = {
			title: 'Edit Post',
			description: 'A blog template made with NodeJS, ExpressJS, and EJS',
		};
		const data = await Post.findOne({_id: req.params.id});
		res.render('admin/edit-post', {locals, data, layout: adminLayout});
	} catch (error) {
		console.log(error);
	}
});

/*
 * PUT /EDIT-POST
 * ADMIN - EDIT POST
 */
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
	try {
		await Post.findByIdAndUpdate(req.params.id, {
			title: req.body.title,
			body: req.body.body,
			updatedAt: Date.now(),
		});
		res.redirect(`/dashboard`);
	} catch (error) {
		console.log(error);
	}
});

/*
 * DELETE /DELETE-POST
 * ADMIN - DELETE POST
 */
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
	try {
		await Post.deleteOne({_id: req.params.id});
		res.redirect('/dashboard');
	} catch (error) {
		console.log(error);
	}
});

module.exports = router;
