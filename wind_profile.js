const axios = require("axios");
const fs = require("fs");

const handler = async function(ctx) {
    const { MongoClient } = require("mongodb");
    // const client = new MongoClient( "mongodb://localhost:27017");
    const client = new MongoClient("mongodb://172.29.245.0:27017/corrently");
    await client.connect();
    db = client.db('corrently');

    const profile = db.collection("DOYproductionDE");
    let sum = 0;
    let r = [];
    for(let i=1;i<367;i++) {
        let windE = await profile.findOne({doy:i,psrType:'B19'});
        sum += 1* windE.sum;
        r.push({
            doy:i-1,
            pwr:windE.sum
        });       
    }
    let factor = 10000/sum;
    for(let i=0;i<r.length;i++) {
        r[i].pwr = Math.round(r[i].pwr * factor);
    }
    let q = [];
    for(let i=0;i<r.length;i++) {
        let pwr_n = r[i].pwr;
        let pwr_n1 = r[i].pwr;
        if(i<r.length - 1) pwr_n1 = r[i + 1].pwr;

        for(let j=0;j<96;j++) {
            q.push({
                date:new Date( (i*86400000) + (j * 900000) ).toISOString(),
                pwr:Math.round(((pwr_n * (96-j))/96)+((pwr_n1 * (j))/96)) 
            });
        }
    }
    let csvwind = 'date;pwr\n';
    sum = 0;
    for(let i=0;i<q.length;i++) {
        csvwind += q[i].date + ";" + (q[i].pwr/1000) + "\n";
        sum += q[i].pwr;
    }
    fs.writeFileSync("profile_wind.csv",csvwind);
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