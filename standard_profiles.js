const axios = require("axios");
const fs = require("fs");

const handler = async function(ctx) {
    const { MongoClient } = require("mongodb");
    // const client = new MongoClient( "mongodb://localhost:27017");
    const client = new MongoClient("mongodb://172.29.245.0:27017/corrently");
    await client.connect();
    db = client.db('corrently');

    const loadprofiles = db.collection("loadprofiles");
    let result = {};

    let elements = [];
    let from = ctx.params.from * 1;
    let to = new Date().getTime();
    if(typeof ctx.params.to !== 'undefined') {
        to = ctx.params.to * 1
    } else {
        ctx.params.to = to;
    }
    let cache = {};

    from = Math.floor(from/900000)*900000;
    let sum = {};
    console.debug("Retrieving");
    let csvG0 = 'date;pwr\n';
    let csvG1 = 'date;pwr\n';
    let csvG2 = 'date;pwr\n';
    let csvG3 = 'date;pwr\n';
    let csvG4 = 'date;pwr\n';
    let csvG5 = 'date;pwr\n';
    let csvG6 = 'date;pwr\n';
    let csvL0 = 'date;pwr\n';
    let csvL1 = 'date;pwr\n';
    let csvL2 = 'date;pwr\n';
    let csvH0 = 'date;pwr\n';
    for(let i=from;i<to;i += 900000) {
                let periodId = '';
                let season = 'transition';
                let month = new Date(i).getMonth() + 1;
                let tzOffset = 3600000;

                if(month <3 ) season = 'winter'; else
                if(month > 10) season='winter';
                if((month >5) && (month <9)) season='summer'; else
                if((month == 3) && (new Date(i).getDate() < 21)) season='winter'; else
                if((month == 9) && (new Date(i).getDate() < 15)) season='summer';

                // Do tzOffset
                if((month > 3) && (month < 11)) tzOffset *= 2;

               
                periodId += season + '_';
                const day = new Date(i).getDay() + 1;
                periodId += day + '_';
                let slotOfDay =  (i+tzOffset) - (Math.floor((i+tzOffset)/86400000)*86400000);
                periodId += slotOfDay;

                if(typeof cache[periodId] == 'undefined') {
                    cache[periodId] = await loadprofiles.findOne({periodId:periodId});
                    delete cache[periodId]._id;
                    delete cache[periodId].field1;
                    delete cache[periodId].periodId;
                 

                    //console.log(new Date(i),cache[periodId].g0 * ctx.params.consumption);
                    cache[periodId].g0 = cache[periodId].g0 * ctx.params.consumption;
                    cache[periodId].g1 = cache[periodId].g1 * ctx.params.consumption;
                    cache[periodId].g2 = cache[periodId].g2 * ctx.params.consumption;
                    cache[periodId].g3 = cache[periodId].g3 * ctx.params.consumption;
                    cache[periodId].g4 = cache[periodId].g4 * ctx.params.consumption;
                    cache[periodId].g5 = cache[periodId].g5 * ctx.params.consumption;
                    cache[periodId].g6 = cache[periodId].g6 * ctx.params.consumption;
                    cache[periodId].h0 = cache[periodId].h0 * ctx.params.consumption;
                    cache[periodId].l0 = cache[periodId].l0 * ctx.params.consumption;
                    cache[periodId].l1 = cache[periodId].l1 * ctx.params.consumption;
                    cache[periodId].l2 = cache[periodId].l2 * ctx.params.consumption;
                    cache[periodId].weekday = cache[periodId].weekday * 1;
                    cache[periodId].periodOfDay = (slotOfDay/900000);



                }
                elements.push({
                    timestamp:new Date(i).toISOString(),
                    lp:cache[periodId]
                });
                if(typeof sum["g0"] == 'undefined') sum["g0"] = 0;
                if(typeof sum["g1"] == 'undefined') sum["g1"] = 0;
                if(typeof sum["g2"] == 'undefined') sum["g2"] = 0;
                if(typeof sum["g3"] == 'undefined') sum["g3"] = 0;
                if(typeof sum["g4"] == 'undefined') sum["g4"] = 0;
                if(typeof sum["g5"] == 'undefined') sum["g5"] = 0;
                if(typeof sum["g6"] == 'undefined') sum["g6"] = 0;
                if(typeof sum["h0"] == 'undefined') sum["h0"] = 0;
                if(typeof sum["l0"] == 'undefined') sum["l0"] = 0;
                if(typeof sum["l1"] == 'undefined') sum["l1"] = 0;
                if(typeof sum["l2"] == 'undefined') sum["l2"] = 0;



                sum["g0"] += (cache[periodId].g0 * ctx.params.consumption)/4;
                sum["g1"] += (cache[periodId].g1 * ctx.params.consumption)/4;
                sum["g2"] += (cache[periodId].g2 * ctx.params.consumption)/4;
                sum["g3"] += (cache[periodId].g3 * ctx.params.consumption)/4;
                sum["g4"] += (cache[periodId].g4 * ctx.params.consumption)/4;
                sum["g5"] += (cache[periodId].g5 * ctx.params.consumption)/4;
                sum["g6"] += (cache[periodId].g6 * ctx.params.consumption)/4;
                sum["h0"] += (cache[periodId].h0 * ctx.params.consumption)/4;
                sum["l0"] += (cache[periodId].l0 * ctx.params.consumption)/4;
                sum["l1"] += (cache[periodId].l1 * ctx.params.consumption)/4;
                sum["l2"] += (cache[periodId].l2 * ctx.params.consumption)/4;
                let ds = new Date(i).toISOString();
                csvG0 += ds + ";" + (cache[periodId].g0 * ctx.params.consumption )/4 + "\n";
                csvG1 += ds + ";" + (cache[periodId].g1 * ctx.params.consumption )/4 + "\n";
                csvG2 += ds + ";" + (cache[periodId].g2 * ctx.params.consumption )/4 + "\n";
                csvG3 += ds + ";" + (cache[periodId].g3 * ctx.params.consumption )/4 + "\n";
                csvG4 += ds + ";" + (cache[periodId].g4 * ctx.params.consumption )/4 + "\n";
                csvG5 += ds + ";" + (cache[periodId].g5 * ctx.params.consumption )/4 + "\n";
                csvG6 += ds + ";" + (cache[periodId].g6 * ctx.params.consumption )/4 + "\n";
                csvL0 += ds + ";" + (cache[periodId].l0 * ctx.params.consumption )/4 + "\n";
                csvL1 += ds + ";" + (cache[periodId].l1 * ctx.params.consumption )/4 + "\n";
                csvL2 += ds + ";" + (cache[periodId].l2 * ctx.params.consumption )/4 + "\n";
                csvH0 += ds + ";" + (cache[periodId].h0 * ctx.params.consumption )/4 + "\n";
    }
    fs.writeFileSync("lp_g0.csv",csvG0);
    fs.writeFileSync("lp_g1.csv",csvG1);
    fs.writeFileSync("lp_g2.csv",csvG2);
    fs.writeFileSync("lp_g3.csv",csvG3);
    fs.writeFileSync("lp_g4.csv",csvG4);
    fs.writeFileSync("lp_g5.csv",csvG5);
    fs.writeFileSync("lp_g6.csv",csvG6);
    fs.writeFileSync("lp_l0.csv",csvL0);
    fs.writeFileSync("lp_l1.csv",csvL1);
    fs.writeFileSync("lp_l2.csv",csvL2);
    fs.writeFileSync("lp_h0.csv",csvH0);

    console.log('Profile',sum);
    return {
        input:ctx.params,
        output:{
            sum:sum
        }
    }
}

handler({
    params:{
        filename:"profile_pv.csv",
        from:0,
        to:0 + (365 * 86400000),
        consumption:1 // hack to get the 15 minutes in based on 1 mio wh
    }
});