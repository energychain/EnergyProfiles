module.exports = function(RED) {
    function Reader(config) {
        RED.nodes.createNode(this,config);
        const fs = require("fs");
        const node = this;

        node.on('input', async function(msg) {
            const fstr = fs.readFileSync(__dirname + '/' + config.filename,{encoding: "utf8"});
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
    RED.nodes.registerType("ProfileReader",Reader);
}
