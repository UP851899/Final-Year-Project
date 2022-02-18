const express = require('express');
const app = express();
const port = 8080; // Local machine testing

app.get('/', (req, res) => {
    res.send('Success');
});

// Console log for server start - Testing on local machine
app.listen(port, (e) => {
    console.log(`server ${e ? 'failed to start' : `listening on port ${port}`}`);
});