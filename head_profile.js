const axios = require("axios");
const fs = require("fs");

const handler = async function(ctx) {
    const input = JSON.parse(fs.readFileSync("head_raw.json"));
    let r = []
    for(let i=0;i<input.days.length;i++) {
        let deg = 12 - input.days[i].tempmin;
        if(input.days[i].tempmin > 12) deg = 0;

        r.push({
            day:new Date(i*86400000),
            deg:deg
        });
    }
    let sum = 0;
    for(let i=0;i<r.length;i++) {
        sum += r[i].deg;
    }
    let factor = 1000000/sum;
    let q=[];
    for(let i=0;i<r.length;i++) {
        for(let j=0;j<96;j++) {
            q.push({
                date:new Date( (i*86400000) + (j * 900000)).toISOString(),
                pwr:Math.round((r[i].deg * factor)/96) 
            });
        }
    }
    console.log(q);
    let csvwind = 'date;pwr\n';
    sum = 0;
    for(let i=0;i<q.length;i++) {
        csvwind += q[i].date + ";" + (q[i].pwr/1000) + "\n";
        sum += q[i].pwr;
    }
    fs.writeFileSync("profile_heading.csv",csvwind);
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