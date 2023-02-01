module.exports = function(RED) {
    function Reader(config) {
        RED.nodes.createNode(this,config);
        const fs = require("fs");
        const node = this;
        node.api = RED.nodes.getNode(config.api);

        node.on('input', async function(msg) {

            let fstr = null;
            if(!fs.existsSync(node.api.baseDir + '/profile_wind.csv')) {
                const axios = require("axios");
                let profile = null;
                try {
                    profile = await axios.get('https://static.corrently.cloud/loadprofiles/profile_wind.csv');
                    fs.writeFileSync(node.api.baseDir + '/profile_wind.csv',profile.data);
                    fstr = profile.data;
                    node.status({fill:'green',shape:"dot",text:"Profile data retrieved"});
                } catch(e) {
                    console.log(e);
                    node.status({fill:'red',shape:"dot",text:"Failed to retrieve"});
                }
            } else {
                node.status({fill:'green',shape:"dot",text:""});
                fstr = fs.readFileSync(node.api.baseDir + '/profile_wind.csv',{encoding: "utf8"});
            }

            let rows = fstr.split('\n');
            for(let i=1;i<rows.length;i++) {
                rows[i] = rows[i].split(';');
                if(isNaN(rows[i][1])) rows[i][1] = 0;

                rows[i][1] *= config.multiplicator;
                rows[i][1] = rows[i][1];
            }
            rows = rows.slice(1);
            if(Array.isArray(msg.payload)) {
                for(let j=0;(j<msg.payload.length)&&(j<rows.length);j++) {
                    msg.payload[j][1] += rows[j][1];
                }
            } else {
                msg.payload = rows;
            }
            node.send(msg);
        });
    }
    RED.nodes.registerType("Wind-Generation",Reader);
}
