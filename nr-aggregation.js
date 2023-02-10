module.exports = function(RED) {
    function Reader(config) {
        RED.nodes.createNode(this,config);
        const fs = require("fs");
        const node = this;
        node.api = RED.nodes.getNode(config.api);
        let aggregation = [];
        let cnt =0;
        node.on('input', function(msg) {
            if(Array.isArray(msg.payload)) {
                    cnt ++;
                    if(aggregation.length == 0) {
                        aggregation = msg.payload;
                        node.status({ fill: "yellow", shape: "ring", text: "Valid ("+cnt+")"});
                    } else {
                        if(msg.payload.length > 35039) {
                            for(let i=0;(i<msg.payload.length)&&(i<aggregation.length);i++) {
                                aggregation[i][1] += msg.payload[i][1];
                            }
                            node.status({ fill: "green", shape: "ring", text: "Valid ("+cnt+")"});
                          
                        } else {
                            node.status({ fill: "red", shape: "ring", text: "No standard profile ("+msg.payload.length+")"});
                        }
                    }
            } else {
                let res = [];
                if(aggregation.length > 0) {
                    for(let i=0;i<aggregation.length;i++) {
                        res.push([aggregation[i][0],aggregation[i][1]]);
                    }
                    msg.payload = res;
                    node.send(msg);
                    aggregation = [];
                    cnt =0;
                    node.status({ fill: "yellow", shape: "ring", text: "Reset"});
                } else {
                    node.status({ fill: "yellow", shape: "ring", text: "Empty"});
                }
            }
        });
    }
    RED.nodes.registerType("Aggregation",Reader);
}
