const Task = require('../models/task')
const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
// const cors = require('cors')
// const corsOptions = {
//     origin: '*',
//     allowedHeaders: 'Content-Type, Authorization',
//     optionsSuccessStatus:200,
//     credentials: true,
//     preflightContinue: true
// }
// router.use('/tasks',  cors(corsOptions))

// retrieve all tasks in collection
// GET /tasks?completed=true
// GET /tasks?limit=10&skip=2
// GET /tasks?sortBy=createdAt_desc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    
    if(req.query.sortBy) {
        const parts = req.query.sortBy.split('_')
        sort[parts[0]] = parts[1] === 'desc' ? -1:1             // bracket notation
    }
    
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.status(200).send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }
})
// find task by its id
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({_id, owner: req.user._id})

        if (!task)
            return res.status(400).send({ error: "No matching tasks found" })

        res.status(200).send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})
// create task 
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// update task
router.patch('/tasks/:id', auth, async (req, res) => {
    try {
        const updates = Object.keys(req.body)
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        
        if (!task) {
            return res.status(404).send()
        }
        
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

        res.status(200).send(task)
    } catch (e) {
        res.status(500).send(e)
    }

})

// delete task
router.delete('/tasks/:id', auth, async (req, res) => {

    try {
        const task = await Task.findOneAndDelete({ _id:req.params.id, owner: req.user.id })
        if (!task) {
            return res.status(404).send('no matching tasks were found.')
        }

        res.status(200).send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router
