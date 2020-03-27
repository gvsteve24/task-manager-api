const path = require('path')
const express = require('express')
require('./db/mongoose')
const app = express()
const port = process.env.PORT
const userRouter = require('./routes/users')
const taskRouter = require('./routes/tasks')
const publicDirectory = path.join(__dirname, '../public')

app.use(express.static(publicDirectory))
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

// app.use(( req, res, next) => {
//   res.status(503).send('Site is now under maintenance.')
// })

/* GET home page. */
app.get('/', function(req, res, next) {
  res.render('index');
});

app.listen(port, () => {
  console.log('Server is running on port '+ port)
})

