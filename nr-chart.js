module.exports = function(RED) {
    function Reader(config) {
        RED.nodes.createNode(this,config);
        const fs = require("fs");
        const node = this;
        node.api = RED.nodes.getNode(config.api);

        node.on('input', async function(msg) {
            let cdata = [{
                "series": ["Balance"],
                "data": [
                    []
                ],
                "labels": [""]
            }];
            
            for(let i=0;i<msg.payload.length;i++) {
                cdata[0].data[0].push(
                    { "x": new Date(msg.payload[i][0]).getTime(), "y": msg.payload[i][1]}
                );
            }
            msg.payload = cdata;
            node.send(msg);
        });
    }
    RED.nodes.registerType("Chart",Reader);
}
