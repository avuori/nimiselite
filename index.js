var express = require("express");
var app = express();
var selite = require("./selite").selite;

app.get("/api/selite/:nimi", function (req, res) {
    res.json(selite(req.params.nimi));
});

var port = process.env.PORT || 3000;
app.listen(port);
console.log("Nimiselite running on port %d in %s mode", port, app.settings.env);
