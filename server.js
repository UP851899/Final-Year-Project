const express = require('express');
const app = express();

app.get('/', (req, res) => {
    console.log(req);
    res.send('test received');
});

app.listen(8080, () =>
    console.log('proxy listening on port 8080'),
);
