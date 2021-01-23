const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const dayjs = require('dayjs')
const passport = require('passport')
const User = require('../models/User.js')
const Topic = require('../models/Topic.js')
const GUser = require('../models/GUser.js')
const Comment = require('../models/Comment.js')

router.get('/', (req, res) => {
    const bearerToken = req.cookies.token
    if (typeof bearerToken !== 'undefined') {
        jwt.verify(bearerToken, 'secret', (err, result) => {
            if (err) {
                return handleError(err)
            } else {
                Topic.find((err, topic) => {
                    if (err) {
                        return handleError(err)
                    }
                    if (topic) {
                        let date = []
                        for (i = 0; i < topic.length; i++) {
                            date[i] = dayjs(topic[i].createAt).format('ddd MMM DD YYYY hh:mm:ss')
                        }
                        res.render('home', {
                            username: result.username,
                            email: result.email,
                            result: topic,
                            date: date
                        })
                    }
                }).sort({
                    createAt: -1
                }).limit(6)
            }
        })
    } else {
        Topic.find((err, topic) => {
            if (err) {
                return handleError(err)
            }
            if (topic) {
                let date = []
                for (i = 0; i < topic.length; i++) {
                    date[i] = dayjs(topic[i].createAt).format('ddd MMM DD YYYY hh:mm:ss')
                }
                res.render('home', {
                    email: null,
                    result: topic,
                    date: date
                })
            }
        }).sort({
            createAt: -1
        }).limit(6)
    }
})

router.get('/login', isLoggedIn, (req, res) => {
    res.render('login', {
        email: null
    })
})

router.post('/login', (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.render('login', {
            email: null,
            err_msg: 'Please fill out all field.'
        })
        return
    }
    if (req.body.email && req.body.password.length < 6) {
        res.render('login', {
            email: null,
            err_msg: 'Password must be at least 6 chracters.'
        })
        return
    }
    User.findOne({
        email: req.body.email,
        password: req.body.password
    }, (err, result) => {
        if (err) {
            console.log(err)
            return
        }
        if (result) {
            jwt.sign({
                username: result.username,
                email: result.email
            }, 'secret', (err, token) => {
                res.cookie('token', token)
                res.redirect('/')
            })
        } else {
            res.render('login', {
                email: null,
                err_msg: 'Email or password is incorrect.'
            })
        }
    })
})

router.get('/register', isLoggedIn, (req, res) => {
    res.render('register', {
        email: null
    })
})

router.post('/register', (req, res) => {
    if (!req.body.username || !req.body.email || !req.body.password) {
        res.render('register', {
            email: null,
            err_msg: 'Please fill out all field.'
        })
        return
    }
    if (req.body.username && req.body.email && req.body.password.length < 6) {
        res.render('register', {
            email: null,
            err_msg: 'Password must be at least 6 chracters.'
        })
        return
    }
    User.findOne({
        email: req.body.email
    }, (err, result) => {
        if (err) {
            console.log(err)
            return
        }
        if (result) {
            res.render('register', {
                err_msg: 'Email is already exist.'
            })
            return
        }
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        })
        newUser.save()
        res.redirect('login')
    })
})

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}))

router.get('/google/callback', passport.authenticate('google', {
    scope: ['profile', 'email'],
    failureRedirect: '/login'
}), (req, res) => {
    GUser.findOne({
        _id: req.session.passport.user
    }, (err, result) => {
        if (err) {
            return handleError(err)
        }
        if (result) {
            jwt.sign({
                username: result.displayName,
                email: result.email
            }, 'secret', (err, token) => {
                res.cookie('token', token)
                res.redirect('/')
            })
        }
    })
})

router.get('/logout', (req, res) => {
    res.clearCookie('token')
    res.redirect('/')
})

router.get('/add', checkToken, (req, res) => {
    jwt.verify(req.token, 'secret', (err, result) => {
        if (err) {
            res.sendStatus('token is incorrect')
        } else {
            res.render('add', {
                username: result.username,
                email: result.email
            })
        }
    })
})

router.post('/add', checkToken, (req, res) => {
    jwt.verify(req.token, 'secret', (err, result) => {
        if (err) {
            res.sendStatus('token is incorrect')
        } else {
            const newTopic = new Topic({
                title: req.body.title,
                username: result.username,
                email: result.email,
                message: req.body.message
            })
            newTopic.save()
            res.redirect('login')
        }
    })
})

router.get('/profile', checkToken, (req, res) => {
    jwt.verify(req.token, 'secret', (err, result) => {
        if (err) {
            res.sendStatus('token is incorrect')
        } else {
            res.render('profile', {
                username: result.username,
                email: result.email
            })
        }
    })
})

router.get('/mytopic', checkToken, (req, res) => {
    jwt.verify(req.token, 'secret', (err, result) => {
        if (err) {
            res.sendStatus('token is incorrect')
        } else {
            Topic.find({
                email: result.email
            }, (err, topic) => {
                if (err) {
                    console.log(err)
                    return
                }
                if (topic) {
                    let date = []
                    let page = Math.ceil(topic.length / 4)
                    for (i = 0; i < topic.length; i++) {
                        date[i] = dayjs(topic[i].createAt).format('ddd MMM DD YYYY hh:mm:ss')
                    }
                    res.render('mytopic', {
                        username: result.username,
                        email: result.email,
                        result: topic,
                        date: date,
                        limit: 4
                    })
                }
            }).sort({
                createAt: -1
            })
        }
    })
})

router.get('/topic/:_id', (req, res) => {
    const bearerToken = req.cookies.token
    if (typeof bearerToken !== 'undefined') {
        jwt.verify(bearerToken, 'secret', (err, result) => {
            if (err) {
                return handleError(err)
            } else {
                let topicData = {}
                let commentsData = {}
                Topic.findOne({
                    _id: req.params._id
                }, (err, topic) => {
                    if (err) {
                        console.log(err)
                    } else {
                        Comment.find({
                            topicID: req.params._id
                        }, (err, comments) => {
                            if (err) {
                                console.log(err)
                            } else {
                                let topicDate = ''
                                topicDate = dayjs(topic.createAt).format('ddd MMM DD YYYY hh:mm:ss')

                                let commentsDate = []
                                for (i = 0; i <= comments.length - 1; i++) {
                                    commentsDate[i] = dayjs(comments[i].createAt).format('ddd MMM DD YYYY hh:mm:ss')
                                }
                                topicData = {
                                    topic,
                                    topicDate
                                }
                                commentsData = {
                                    comments,
                                    commentsDate
                                }
                                
                                if (req.cookies.err_msg) {
                                    res.locals.err = {
                                        msg: req.cookies.err_msg
                                    }
                                }

                                res.render('topic', {
                                    email: result.email,
                                    username: result.username,
                                    topicData,
                                    commentsData
                                })
                            }
                        })
                    }
                })
            }
        })
    } else {
        let topicData = {}
        let commentsData = {}
        Topic.findOne({
            _id: req.params._id
        }, (err, topic) => {
            if (err) {
                console.log(err)
            } else {
                Comment.find({
                    topicID: req.params._id
                }, (err, comments) => {
                    if (err) {
                        console.log(err)
                    } else {
                        let topicData = {}
                        let commentsData = {}
                        Topic.findOne({
                            _id: req.params._id
                        }, (err, topic) => {
                            if (err) {
                                console.log(err)
                            } else {
                                Comment.find({
                                    topicID: req.params._id
                                }, (err, comments) => {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        let topicDate = ''
                                        topicDate = dayjs(topic.createAt).format('ddd MMM DD YYYY hh:mm:ss')

                                        let commentsDate = []
                                        for (i = 0; i <= comments.length - 1; i++) {
                                            commentsDate[i] = dayjs(comments[i].createAt).format('ddd MMM DD YYYY hh:mm:ss')
                                        }

                                        topicData = {
                                            topic,
                                            topicDate
                                        }
                                        commentsData = {
                                            comments,
                                            commentsDate
                                        }
                                        res.render('topic', {
                                            email: null,
                                            topicData,
                                            commentsData
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }
})

router.post('/topic/:_id', (req, res) => {
    const bearerToken = req.cookies.token
    if (typeof bearerToken !== 'undefined') {
        jwt.verify(bearerToken, 'secret', (err, result) => {
            if (err) {
                console.log(err)
            } else {
                const topicID = req.params._id
                if (!req.body.comment) {
                const topicID = req.params._id
                    res.cookie('err_msg', 'Please enter the comment.', {
                        maxAge: 3000
                    })
                    res.redirect('/topic/' + topicID)
                    return
                }
                const newComment = new Comment({
                    topicID: topicID,
                    username: result.username,
                    email: result.email,
                    comment: req.body.comment
                })
                newComment.save()
                res.redirect('/topic/' + topicID)
            }
        })
    }
})

router.get('/mytopic/delete/:_id', checkToken, (req, res) => {
    jwt.verify(req.token, 'secret', (err, result) => {
        if (err) {
            res.sendStatus('token is incorrect')
        } else {
            Topic.deleteOne({
                _id: req.params._id,
                email: result.email
            }, (err) => {
                if (err) {
                    return handleError(err)
                } else {
                    res.redirect('/mytopic')
                }
            })
        }
    })
})

function checkToken(req, res, next) {
    const bearerToken = req.cookies.token
    if (typeof bearerToken !== 'undefined') {
        req.token = bearerToken
        next()
    } else {
        res.redirect('/', {
            email: null
        })
    }
}

function isLoggedIn(req, res, next) {
    if (req.cookies.token) {
        res.redirect('/')
    } else {
        next()
    }
}

module.exports = router