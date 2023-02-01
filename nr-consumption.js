module.exports = function(RED) {
    function Reader(config) {
        RED.nodes.createNode(this,config);
        const fs = require("fs");
        const node = this;
        node.api = RED.nodes.getNode(config.api);

        node.on('input', async function(msg) {
            let fstr = null;
            if((typeof config.profile == 'undefined') || (config.profile == null) || (config.profile.length < 5)) {
                    config.profile = config.filename;
                    node.status({fill:'yellow',shape:"dot",text:"Using Standard profile"});
            } else {
                node.status({fill:'green',shape:"dot",text:"Individual Profile"});
            }
            if(!fs.existsSync(node.api.baseDir + '/'+config.profile)) {
                const axios = require("axios");
                let profile = null;
                try {
                    profile = await axios.get('https://static.corrently.cloud/loadprofiles/'+config.profile);
                    fs.writeFileSync(node.api.baseDir + '/'+config.profile,profile.data);
                    fstr = profile.data;
                   // node.status({fill:'green',shape:"dot",text:"Profile data retrieved"});
                } catch(e) {
                    node.status({fill:'yellow',shape:"dot",text:"Custrom Profile not found using standard profile"});
                    profile = await axios.get('https://static.corrently.cloud/loadprofiles/'+config.filename);
                    fs.writeFileSync(node.api.baseDir + '/'+config.filename,profile.data);
                    fstr = profile.data;
               }
            } else {
                node.status({fill:'green',shape:"dot",text:""});
                fstr = fs.readFileSync(node.api.baseDir + '/'+config.profile,{encoding: "utf8"});
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
    RED.nodes.registerType("Consumption",Reader);
}
