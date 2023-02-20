module.exports = function(RED) {
    function Reader(config) {
        RED.nodes.createNode(this,config);
        const node = this;
        node.api = RED.nodes.getNode(config.api);

        node.on('input', async function(msg) {
            let balance = 0;
            let neg = 0;
            let pos = 0;
            let total_gen = 0;
            let total_cons = 0;

            for (let i = 0; i < msg.payload.length; i++) {
                balance += 1 * msg.payload[i][1];
                if (msg.payload[i][1] > 0) {
                    pos += msg.payload[i][1];
                } else {
                    neg += msg.payload[i][1];
                }
                total_gen += 1 * msg.payload[i][4];
                total_cons += 1 * msg.payload[i][5];
            }
            balance = Math.round(balance / 1000);
            neg = Math.round(neg / 1000);
            pos = Math.round(pos / 1000);
            node.status({ fill: "red", shape: "ring", text: "Balance:" + balance });
            let msgIn = msg;
            let msgBalance = {
                payload: {
                    consumption:total_cons,
                    generation:total_gen,
                    balance:balance,
                    "1.8.0":neg * (-1),
                    "2.8.0":pos,
                    grid:Math.abs(neg) + Math.abs(pos)
                }
            }
            node.send([msgIn,msgBalance]);
        });
    }
    RED.nodes.registerType("Balancing",Reader);
}
