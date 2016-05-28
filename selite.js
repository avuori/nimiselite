var fs = require("fs");

function loadDataset(data) {
    return data.split("\n")
                .filter(function (row) {
                    return row.indexOf(";") !== -1;
                })
                .map(function (row) {
                    var fields = row.split(";");
                    var nimi = fields[0].replace(/\s/, "");
                    var lkm = parseInt(fields[1].replace(/\s/, ""), 10);
                    return { nimi: nimi, lkm: lkm };
                });
}

var opts = {
    encoding: "UTF-8"
};
var data = {
    etunimet_miehet: loadDataset(fs.readFileSync("./data/HNimidatan-avaaminen2016JulkaistavatMiehetkaikkietunimet2016.csv", opts)),
    etunimet_naiset: loadDataset(fs.readFileSync("./data/HNimidatan-avaaminen2016JulkaistavatNaisetkaikkietunimet2016.csv", opts)),
    sukunimet: loadDataset(fs.readFileSync("./data/HNimidatan-avaaminen2016JulkaistavatSukunimet2016.csv", opts))
}

var occurrences = {};
Object.keys(data).forEach(function (dataset) {
    occurrences[dataset] = {};
    data[dataset].forEach(function (row) {
        occurrences[dataset][row.nimi] = row.lkm;
    });
});

function guess(nimi) {
    var nimet = nimi.split(/\s+/);
    var r = [];
    nimet.forEach(function (n) {
        r.push({
            nimi: n,
            mies: occurrences.etunimet_miehet[n] || 0,
            nainen: occurrences.etunimet_naiset[n] || 0,
            sukunimi: occurrences.sukunimet[n] || 0,
        });
    });
    
    var sortByMies = r.slice().sort(function (a, b) {
        return b.mies - a.mies;
    });
    var sortByNainen = r.slice().sort(function (a, b) {
        return b.nainen - a.nainen;
    });
    var sortBySuku = r.slice().sort(function (a, b) {
        return b.sukunimi - a.sukunimi;
    });

    var sukunimi = sortBySuku[0].nimi;

    var etunimet = nimet.filter(function (n) {
        return n !== sukunimi;
    });

    var sukupuoliScore = 0;
    r.forEach(function (rec) {
        sukupuoliScore += rec.mies - rec.nainen
    });

    var sukupuoli;
    if (sukupuoliScore < 0) {
        sukupuoli = "nainen";
    } else if (sukupuoliScore > 0) {
        sukupuoli = "mies";
    } else {
        sukupuoli = "ei tietoa";
    }

    return {
        //data: r,
        etunimet: etunimet,
        sukunimi: sukunimi,
        sukupuoli: sukupuoli,
        sukupuolinumero: sukupuoliScore
    };
}

exports.selite = function (nimi) {
    return guess(nimi);
};
