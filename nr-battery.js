module.exports = function(RED) {
    function Storage(config) {
        RED.nodes.createNode(this,config);
        const node = this;
        node.api = RED.nodes.getNode(config.api);
        
        node.on('input', async function(msg) {
            let soc = 0;
            const capacity = config.capacity * 1000;
            const loss = 1 - (config.loss/100);
              
            if(Array.isArray(msg.payload)) {
                for(let j=0;(j<msg.payload.length);j++) {
                    let demand = msg.payload[j][1] * 1;
                    let responds = 0;

                    if(demand >0) {
                            // Load
                            if(demand  > (config.loadW/4) * 1000) demand =  (config.loadW/4) * 1000;

                            if(soc<capacity) {
                                if(demand + soc < capacity) {
                                    responds = demand;
                                    soc+= demand;
                                } else {
                                    responds = capacity - soc;
                                    soc=capacity;
                                }
                            }
                            responds *= -1;
                    } else {
                        demand *= -1;
                        if(demand  > (config.unloadW/4) * 1000) demand =  (config.unloadW/4) * 1000;
                            
                         if(soc>demand) {
                                responds = demand * loss;
                                soc -= demand;
                         } else {
                            responds = soc * loss;
                            soc = 0;
                         }
                    }
                    msg.payload[j][1] += 1 * responds;
                   // msg.payload[j]=[msg.payload[j][0],msg.payload[j][1],soc];
                }
            } 
            node.send(msg);
        });
    }
    RED.nodes.registerType("Battery",Storage);
}
