const mongoose = require('mongoose')



const db = mongoose.connection


mongoose.connect('mongodb://127.0.0.1:27017/task-manager', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})
db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => {
    console.log('connected')
})
