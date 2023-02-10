module.exports = function(RED) {
    function Reader(config) {
        RED.nodes.createNode(this,config);
        const fs = require("fs");
        const node = this;
        node.api = RED.nodes.getNode(config.api);

        node.on('input', async function(msg) {
            let fstr = ""; 

            if(!fs.existsSync(node.api.baseDir + '/profile_'+config.lat+'_'+config.lon+'.csv')) {
                const axios = require("axios");
                let profile = null;
                try {
                    profile = await axios.get('https://static.corrently.cloud/loadprofiles/profile_'+config.lat+'_'+config.lon+'.csv');
                    fs.writeFileSync(node.api.baseDir + '/profile_'+config.lat+'_'+config.lon+'.csv',profile.data);
                    fstr = profile.data;
                    node.status({fill:'green',shape:"dot",text:"Location data retrieved"});
                } catch(e) {
                    console.log(e);
                    node.status({fill:'yellow',shape:"dot",text:"Fallback to Default Location"});
                    if(!fs.existsSync(node.api.baseDir + '/profile_temperature_mauer.csv')) {
                        profile = await axios.get('https://static.corrently.cloud/loadprofiles/profile_temperature_mauer.csv');
                        fs.writeFileSync(node.api.baseDir + '/profile_temperature_mauer.csv',profile.data);
                    }
                    fstr = fs.readFileSync(node.api.baseDir + '/profile_temperature_mauer.csv',{encoding: "utf8"});
                }
            } else {
                node.status({fill:'green',shape:"dot",text:""});
                fstr = fs.readFileSync(node.api.baseDir + '/profile_'+config.lat+'_'+config.lon+'.csv',{encoding: "utf8"});
            }

            let rows = fstr.split('\n');
            for(let i=1;i<rows.length;i++) {
                rows[i] = rows[i].split(';');
                if(isNaN(rows[i][1])) rows[i][1] = 0;
                rows[i][1] *= config.multiplicator;
                rows[i][2] = 0;
                rows[i][3] = 0;
                rows[i][4] = 0;
                rows[i][5] = 0;

                if(rows[i][1]>0) rows[i][4] = rows[i][1];
                if(rows[i][1]<0) rows[i][5] = rows[i][1];
            }
            rows = rows.slice(1);
            let soc = 0;
            if(Array.isArray(msg.payload)) {
                for(let j=0;(j<msg.payload.length)&&(j<rows.length);j++) {
                    if(msg.payload[j].length < 4) {
                        msg.payload[j] = [msg.payload[j][0],msg.payload[j][1],0,0,0,0];
                    }
                    msg.payload[j][1] += rows[j][1];
                    msg.payload[j][5] += rows[j][5];
                }
            } else {
                msg.payload = rows;
            }
            node.send(msg);
        });
    }
    RED.nodes.registerType("Heating",Reader);
}
