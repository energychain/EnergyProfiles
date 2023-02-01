module.exports = function(RED) {
    function Reader(config) {


        const handler = async function(ctx) {
            const startTime = new Date().getTime();
            if(typeof ctx.params.wp == 'undefined') ctx.params.wp = 1000000;
            if(typeof ctx.params.lat == 'undefined') ctx.params.lat = "49.342";
            if(typeof ctx.params.lon == 'undefined') ctx.params.lon = "8.8006813";
            if(typeof ctx.params.deg == 'undefined') ctx.params.deg = "32";
            if(typeof ctx.params.az == 'undefined') ctx.params.az = "45";
            if(typeof ctx.params.kwp !== 'undefined') ctx.params.wp = ctx.params.kwp * 1000000;
            if(typeof ctx.params.loss == 'undefined') ctx.params.loss = "14";
            if(typeof ctx.params.tech == 'undefined') ctx.params.tech = "crystSi"; //  "crystSi", "CIS", "CdTe" and "Unknown".
            
            let pvHourly = {};
            if(fs.existsSync("tmp_pv.json")) {
                    console.log("Loading from Disk");
                    pvHourly = JSON.parse(fs.readFileSync("tmp_pv.json"));
            } else {
                const axios = require("axios");
                const url = "https://re.jrc.ec.europa.eu/api/seriescalc?outputformat=json&pvcalculation=1&peakpower=1&d2g=1&lat="+ctx.params.lat+"&lon="+ctx.params.lon+"&peakpower=1&pvtechchoice="+ctx.params.tech+"&mountingplace=free&loss=14&angle=32&aspect="+ctx.params.az;
                console.debug("Fetching...");
                const pvcalcResponds = await axios.get(url);
                pvHourly = await pvcalcResponds.data;
                fs.writeFileSync("tmp_pv.json",JSON.stringify(pvHourly));
            }
    
            console.debug("Processing Raw result");
            let year = '';
            let yearstart  = '';
            let hrs = {};
            for(let i=0;i<pvHourly.outputs.hourly.length;i++) {
                let hr = pvHourly.outputs.hourly[i];
                if(hr.time.substring(0,4) !== year) {
                    year = hr.time.substring(0,4);
                    yearstart = new Date(hr.time.substring(0,4)+'-01-01').getTime();
                    console.debug("Processing year "+year);
                }
    
                hr.time = new Date(hr.time.substring(0,4)+'-'+hr.time.substring(4,6)+'-'+hr.time.substring(6,8)+"T"+hr.time.substring(9,11)+":00:00Z")
                hr.yrHr = (hr.time.getTime() - yearstart)/3600000;
                if(typeof hrs["h"+hr.yrHr] == 'undefined') {
                    hrs["h"+hr.yrHr] = {
                        cnt:0,
                        pwr:0
                    } 
                }
                hrs["h"+hr.yrHr] = {
                    yrHr:hr.yrHr,
                    cnt:hrs["h"+hr.yrHr].cnt + 1,
                    pwr:((hrs["h"+hr.yrHr].pwr * hrs["h"+hr.yrHr].cnt) + hr.P)/(hrs["h"+hr.yrHr].cnt + 1)  
                };
            }
            let totalPower = 0;
            console.debug("Calculating Total Power per Year (Full Load Hours)");
            for (const [key, value] of Object.entries(hrs)) {
                totalPower += value.pwr
            }
            console.debug("Normalize to 1.000.000");
        
            //const factor = 1000000 / totalPower ;
            const factor = 1;
            for (const [key, value] of Object.entries(hrs)) {
                value.pwr = Math.round(value.pwr * factor);
                value.doy = Math.floor(value.yrHr / 24) + 1;
                value.hr = value.yrHr - ((value.doy - 1) * 24)  
                if(value.yrHr > 8759) {
                    // delete hrs[key];
                }
            }
            
            console.debug("Extrapolate to 15min");
            let qtry = {};
            for (const [key, value] of Object.entries(hrs)) {
                let aPwr = value.pwr;
                if(typeof hrs["h"+(value.yrHr+1)] !== 'undefined') {
                    let bPwr = hrs["h"+(value.yrHr+1)].pwr;
                    qtry['q'+((value.yrHr *4))] = {
                        q:value.yrHr *4,
                        min:'00',
                        hr:value.hr,
                        doy:value.doy,
                        pwr:Math.round(aPwr/4) 
                    };
                    qtry['q'+((value.yrHr *4)+1)] = {
                        q:(value.yrHr *4) + 1,
                        min:'15',
                        hr:value.hr,
                        doy:value.doy,
                        pwr: Math.round(((3 * (aPwr/4)) +  (1 * (bPwr/4)))/4) 
                    };
                    qtry['q'+((value.yrHr *4)+2)] = {
                        q:(value.yrHr *4) + 2,
                        min:'30',
                        hr:value.hr,
                        doy:value.doy,
                        pwr: Math.round(((2 * (aPwr/4)) +  2 * ((bPwr/4)))/4) 
                    };
                    qtry['q'+((value.yrHr *4)+3)] = {
                        q:(value.yrHr *4) + 3,
                        min:'45',
                        hr:value.hr,
                        doy:value.doy,
                        pwr: Math.round(( (1 * (aPwr/4)) +  (3 * (bPwr/4)))/4) 
                    };
                }
            }
            delete hrs;
            delete pvHourly;
            totalPower = 0;
            let rawQ = [];
            for (const [key, value] of Object.entries(qtry)) {
                if(value.doy<366) {
                    totalPower += value.pwr;
                    rawQ.push(value);
                }
                
            }
            console.log("Total Power",totalPower);
    
            console.debug("Sorting to Sharpen")
            // Sharpen to 1.000.000
            rawQ.sort((a,b) => b.pwr - a.pwr);
            if(totalPower > 1000000) {
                let j = 0;
                for(let i=totalPower;i>1000000;i--) {
                    rawQ[j].pwr--;
                    j++;
                }
            } 
            rawQ.sort((a,b) => a.q - b.q);
            totalPower = 0;
            console.log("Exporting CSV");
            
            let csv = [];
    
            for(let i=0;i<rawQ.length;i++) {
                totalPower += rawQ[i].pwr;
                csv.push([new Date(rawQ[i].q * 900000).toISOString(),rawQ[i].pwr/1000]);
            }
                        
            return csv;
        }

        RED.nodes.createNode(this,config);
        const fs = require("fs");
        const node = this;
        node.api = RED.nodes.getNode(config.api);
        
        node.on('input', async function(msg) {
            let csv =null;
            if((typeof csv == 'undefined') || (csv == null)) {
                csv = await handler({params:{
                    lat:config.lat,
                    lon:config.lon,
                    az:config.az,
                    deg:config.deg
                }});
            }
            if(Array.isArray(msg.payload)) {
                for(let j=0;((j<msg.payload.length)&&(j<csv.length));j++) {
                    msg.payload[j][1] += (csv[j][1]  * config.multiplicator);
                }
            } else {
                msg.payload = csv;
                for(let j=0;j<msg.payload.length;j++) {
                    msg.payload[j][1] *=  config.multiplicator;
                }
            }
            node.send(msg);
        });
    }
    RED.nodes.registerType("PV-Generation",Reader);
}
