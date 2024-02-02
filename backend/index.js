const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')

///////////////////////////
// Data initialization
///////////////////////////
const app = express()
const port = 3000

//TODO: implement (see 6.1.1)
const columns = require('./data/columns.json') 
const tags = require('./data/tags.json') 

function getTaskIdCounter() {
    let max = 0;
    for (let i = 0; i < columns.length; i++) {
        let curr = parseInt(columns[i]
            .tasks
            .map(task => parseInt(task.id.slice(1)))     // removing first char 't'
            .sort( (a,b) => b - a)[0] );                 // get the max
        if (curr > max) {
            max = curr;
        }
    }
    return max + 1 ;
}


var taskIdCounter = getTaskIdCounter();
// console.log(taskIdCounter);


///////////////////////////
// Server setup
///////////////////////////

//TODO: implement (see 6.1.2)
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

///////////////////////////
// CRUD operations
///////////////////////////

//TODO: implement (see 6.1.3 - 6.1.9)
app.get('/api/counter', (req, res) => {
    res.json({"taskIdCounter" : taskIdCounter});
})

app.get('/api/tags', (req, res) => {
    res.json(tags);
})

app.get('/api/columns', (req, res) => {
    res.json(columns);
})

app.post('/api/tasks', (req, res) => {
    let col =  req.body.column;
    let task = {
        "id": `t${taskIdCounter}`,
        "title": req.body.title,
        "text": req.body.text,
        "tags": req.body.taskTags
        };
    console.log(task);
    columns[col].tasks.push(task);
    taskIdCounter++;
    res.status(201).json({"id": taskIdCounter - 1});
})

function findById(id) {
    let ret = -1; 
    for (let i = 0; i < columns.length; i++){
        let found_id = columns[i].tasks.findIndex(t => t.id == id)
        if( found_id != -1) {
            return {i, found_id};
        }
    }
    return ret;
}

app.put('/api/tasks/:id' , (req, res) => {
    let task = {
        "id": req.params.id,
        "title": req.body.title,
        "text": req.body.text,
        "tags": req.body.taskTags
        };
    console.log(task);
    let idx = findById(req.params.id);
    console.log(idx);
    if (idx != -1) {
        columns[idx.i].tasks[idx.found_id] = task;
        res.status(200).send();
    } else {
        res.status(404).send();
    }
})

app.delete('/api/tasks/:id', (req, res) => {
    let idx = findById(req.params.id);
    if (idx !== -1) {
        columns[idx.i].tasks.splice(idx.found_id, 1);
        res.status(200).send();
    } else {
        res.status(404).send();
    }
})


app.put('/api/move-task/:id', (req, res) => {
    let idx = findById(req.params.id);
    let newCol = req.body.newColumnId;
    if(idx == -1){
        res.status(404).send();
    } else {
        // get the task
        let task = columns[idx.i].tasks[idx.found_id];
        // remove it from the old column
        columns[idx.i].tasks.splice(idx.found_id, 1);
        // add it to the new column
        columns[newCol].tasks.push(task);
        // res.json({"newColumnId": newCol});
        res.status(200).send();
    }
})
///////////////////////////
// Start the server
///////////////////////////

//TODO: implement (see 6.1.2)
app.listen(port)
