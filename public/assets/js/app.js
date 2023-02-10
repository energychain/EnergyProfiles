let flow  = [
    {
        "id": "b9e68c1f20f8661e",
        "type": "tab",
        "label": "Heidenau",
        "disabled": false,
        "info": "",
        "env": []
    },
    {
        "id": "07371433bca7e9ef",
        "type": "inject",
        "z": "b9e68c1f20f8661e",
        "name": "Start",
        "props": [
            {
                "p": "payload"
            },
            {
                "p": "topic",
                "vt": "str"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": true,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "x": 130,
        "y": 60,
        "wires": [
            [
                "dc277d46a9b12f13"
            ]
        ]
    },
    {
        "id": "dc277d46a9b12f13",
        "type": "Wind-Generation",
        "z": "b9e68c1f20f8661e",
        "name": "WKA 10GWha",
        "api": "b58e73a54aabe647",
        "multiplicator": "10000000",
        "x": 320,
        "y": 60,
        "wires": [
            [
                "bc7b4f8a354e027c"
            ]
        ]
    },
    {
        "id": "94a43a01a4086d57",
        "type": "Balancing",
        "z": "b9e68c1f20f8661e",
        "name": "",
        "api": "b58e73a54aabe647",
        "x": 200,
        "y": 220,
        "wires": [
            [
                "15f75f2d774603e4"
            ],
            [
                "011fb4646475c1e7"
            ]
        ]
    },
    {
        "id": "660a9a84d86e497a",
        "type": "Heating",
        "z": "b9e68c1f20f8661e",
        "name": "Flächenheizung 350x((120kwh*150m²)/JAZ3)",
        "api": "b58e73a54aabe647",
        "multiplicator": "-2100000",
        "lat": 0,
        "lon": 0,
        "x": 230,
        "y": 140,
        "wires": [
            [
                "1c786d55cd87977c"
            ]
        ]
    },
    {
        "id": "bc7b4f8a354e027c",
        "type": "Consumption",
        "z": "b9e68c1f20f8661e",
        "name": "Gebäude (350x3000kWha)",
        "api": "b58e73a54aabe647",
        "filename": "lp_h0.csv",
        "profile": "",
        "multiplicator": "-1050000",
        "x": 580,
        "y": 60,
        "wires": [
            [
                "660a9a84d86e497a"
            ]
        ]
    },
    {
        "id": "011fb4646475c1e7",
        "type": "debug",
        "z": "b9e68c1f20f8661e",
        "name": "Profilergebnis",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 380,
        "y": 240,
        "wires": []
    },
    {
        "id": "9ef8571e3378e4ee",
        "type": "Battery",
        "z": "b9e68c1f20f8661e",
        "name": "MTU 1000 KWh Storage",
        "capacity": "1000",
        "api": "b58e73a54aabe647",
        "loadW": "100",
        "unloadW": "100",
        "loss": "10",
        "x": 850,
        "y": 140,
        "wires": [
            [
                "94a43a01a4086d57"
            ]
        ]
    },
    {
        "id": "15f75f2d774603e4",
        "type": "http response",
        "z": "b9e68c1f20f8661e",
        "name": "",
        "statusCode": "",
        "headers": {},
        "x": 390,
        "y": 200,
        "wires": []
    },
    {
        "id": "b2137b8263ed22c6",
        "type": "http in",
        "z": "b9e68c1f20f8661e",
        "name": "",
        "url": "/profile",
        "method": "get",
        "upload": false,
        "swaggerDoc": "",
        "x": 130,
        "y": 20,
        "wires": [
            [
                "dc277d46a9b12f13"
            ]
        ]
    },
    {
        "id": "1c786d55cd87977c",
        "type": "Consumption",
        "z": "b9e68c1f20f8661e",
        "name": "Genossen (4000x2100kWha)",
        "api": "b58e73a54aabe647",
        "filename": "lp_h0.csv",
        "profile": "",
        "multiplicator": "-8400000",
        "x": 580,
        "y": 140,
        "wires": [
            [
                "9ef8571e3378e4ee"
            ]
        ]
    },
    {
        "id": "b58e73a54aabe647",
        "type": "corrently-config",
        "name": "TZ1",
        "token": "0xE791f20fB6b4D3229A42E389a0f1697b900bC412"
    }
]
$(document).ready(function() {
    let co2eq = 0.475;
    
    let html1_8_0 = '<table class="table table-condensed"><tr><th>Bezeichnung</th><th>Jahresarbeit<br/>(kwha)</th></tr>';
    let html2_8_0 = '<table class="table table-condensed"><tr><th>Bezeichnung</th><th>Jahresarbeit<br/>(kwha)</th></tr>';
    let htmlflex = '<table class="table table-condensed"><tr><th>Bezeichnung</th><th>Kapazität<br/>(kwh)</th></tr>';
    
    for(let i=0;i<flow.length;i++) {
      if(flow[i].type == "PV-Generation") { html2_8_0 += '<tr><td>'+flow[i].name+' (PV)</td><td align="right">'+flow[i].multiplicator+'</td></tr>'; }
      if(flow[i].type == "Wind-Generation") { html2_8_0 += '<tr><td>'+flow[i].name+' (Wind)</td><td align="right">'+flow[i].multiplicator+'</td></tr>'; }
      if(flow[i].type == "Heating") { html1_8_0 += '<tr><td>'+flow[i].name+' (Wärme)</td><td align="right">'+flow[i].multiplicator+'</td></tr>'; }
      if(flow[i].type == "Consumption") { html1_8_0 += '<tr><td>'+flow[i].name+' (Profil)</td><td align="right">'+flow[i].multiplicator+'</td></tr>'; }
      if(flow[i].type == "ThermalStorage") { htmlflex += '<tr><td>'+flow[i].name+' (thermisch)</td><td align="right">'+flow[i].capacity+'</td></tr>'; }
      if(flow[i].type == "Battery") { htmlflex += '<tr><td>'+flow[i].name+' (Batterie)</td><td align="right">'+flow[i].capacity+'</td></tr>'; }
    }
    html1_8_0 += '</table>';
    html2_8_0 += '</table>';
    htmlflex += '</table>';
    $('.html1_8_0').html(html1_8_0);
    $('.html2_8_0').html(html2_8_0);
    $('.htmlflex').html(htmlflex);

    $.getJSON("http://localhost:1880/profile",function(profile) {
        let data = [];
        let flexData = [];
        let sum1_8_0 = 0;
        let sum2_8_0 = 0;
        let sumflex = 0;
        let cnt1_8_0 = 0;
        let cnt2_8_0 = 0;
        let in1_8_0 = 0;
        let in2_8_0 = 0;

        let emptyLabels = [];

        for(let i=0;i<profile.length;i++) {
            profile[i][1] = profile[i][1];
            emptyLabels.push("");
            if(profile[i][1] > 0) { sum2_8_0 += Math.abs(profile[i][1]); cnt2_8_0++; }
            if(profile[i][1] < 0) { sum1_8_0 += Math.abs(profile[i][1]); cnt1_8_0++; }
            sumflex += Math.abs(profile[i][2]);
            in2_8_0 += Math.abs(profile[i][4]);
            in1_8_0 += Math.abs(profile[i][5]);
            data.push(
                {
                    date:profile[i][0],
                    kwh:profile[i][1]
                }
            )
            flexData.push(
              {
                  date:profile[i][0],
                  kwh:profile[i][2]
              }
          )
        }
        let inbalance = Math.round((in2_8_0-in1_8_0)/1000);
        $('.inbalance').html(inbalance);
        $('.in1_8_0').html(Math.round(in1_8_0/1000));
        $('.in2_8_0').html(Math.round(in2_8_0/1000));

        let balance = Math.round((sum2_8_0-sum1_8_0)/1000);
        $('#sum1_8_0').html(Math.round(sum1_8_0/1000));
        $('#sum2_8_0').html(Math.round(sum2_8_0/1000));
        $('#balance').html(balance);
        $('.co1_8_0').html(Math.round((sum1_8_0/1000) * co2eq));
        $('.co2_8_0').html(Math.round((sum2_8_0/1000) * co2eq));
        $('.cobalance').html(Math.round( (( in1_8_0 - sum1_8_0)/1000) * co2eq));
        if(balance>0) {
            $('#txtErgebnis').html("einen Überschuss");
        } else {
            $('#txtErgebnis').html("eine Unterdeckung");
        }
        $('#txtBalance').html(balance);
        $('.txt1_8_0').html(Math.round(sum1_8_0/1000));
        $('.txt2_8_0').html(Math.round(sum2_8_0/1000));

        new Chart(
            document.getElementById('chartProfil'),
            {
              type: 'line',
              data: {
                labels: data.map(row => row.date),
                datasets: [
                  {
                    label: 'Jahresprofil',
                    data: data.map(row => row.kwh)
                  }
                ]
              },
              options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'month',
                            displayFormats: {
                                month: 'MMM'
                            }
                        }
                        
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
            }
          );
          new Chart(
            document.getElementById('chartFlex'),
            {
              type: 'line',
              data: {
                labels: data.map(row => row.date),
                datasets: [
                  {
                    label: 'Flexibilität',
                    data: flexData.map(row => row.kwh)
                  }
                ]
              },
              options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'month',
                            displayFormats: {
                                month: 'MMM'
                            }
                        }
                        
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
            }
          );
        data.sort((a,b) => a.kwh - b.kwh);
       
        new Chart(
            document.getElementById('chartGang'),
            {
              type: 'line',
              data: {
                labels: emptyLabels,
                datasets: [
                  {
                    label: 'Jahresdauerlinie',
                    data: data.map(row => row.kwh)
                  }
                ]
              },
              options:{
                /*
                scales: {
                    x: {
                        ticks: {
                            display: false
                        }
                    }
                }
                */
                plugins: {
                    legend: {
                        display: false
                    }
                }
              }
            }
          );
        const formatDate = function(str) {
            const d = new Date(str);
            return (d.getDay()+1) + "." + d.getMonth() +". "+d.getHours() + ":00";
        }
        $('#shaveLeft').html( formatDate(data[1].date) + " "+ (Math.round(data[1].kwh)/1000) + " kWh");
        $('#shaveRight').html(formatDate(data[data.length-1].date)+" "+ (Math.round(data[data.length-1].kwh)/1000) + " kWh");
        $('#cnt1_8_0').html(Math.round((cnt1_8_0/data.length)*100));
        $('#cnt2_8_0').html(Math.round((cnt2_8_0/data.length)*100));
        $('#cntbalance').html(Math.round(( (data.length - (cnt1_8_0 + cnt2_8_0)) /data.length)*100));
        if(sum1_8_0 !== 0) $('#flex1_8_0').html( Math.round( (sumflex/sum1_8_0) * 100 ) );
        if(sum2_8_0 !== 0) $('#flex2_8_0').html( Math.round( (sumflex/sum2_8_0) * 100 ) );
        $('#flex2_8_0').html();
        $('.flexbalance').html( Math.round(sumflex/1000));

        // Eco Model
        let gesamtErzAnIntern = (in1_8_0  - sum1_8_0);
        let gesamtErzAnExtern = sum2_8_0;
        let gesamtErz = gesamtErzAnIntern + gesamtErzAnExtern;

        $('#gesamtErzAnIntern').html(Math.round( (gesamtErzAnIntern / gesamtErz)*100 )+"%");
        $('#gesamtErzAnExtern').html(Math.round( (gesamtErzAnExtern / gesamtErz)*100 )+"%");

        let gesamtNutzVonIntern = Math.abs(in2_8_0  - sum2_8_0);
        let gesamtNutzVonExtern = Math.abs(sum1_8_0);
        let gesamtNutz = Math.abs(gesamtNutzVonIntern) + Math.abs(gesamtNutzVonExtern);

        
        $('#gesamtNutzVonIntern').html(Math.round( (gesamtNutzVonIntern / gesamtNutz)*100 )+"%");
        $('#gesamtNutzVonExtern').html(Math.round( (gesamtNutzVonExtern / gesamtNutz)*100 )+"%");

        $('#priceNutz').unbind();
        $('#priceNutz').on('change',function() {
            $('#priceErz').val(
                ($('#priceNutz').val() * (gesamtErzAnIntern/gesamtErz)) +  
                ($('#priceMarkt').val() * (gesamtErzAnExtern/gesamtErz)) 
            );
        });
        $('#priceErz').unbind();
        $('#priceErz').on('change',function() {
            $('#priceNutz').val(
                ($('#priceErz').val() * (gesamtNutzVonIntern/gesamtNutz)) +  
                ($('#priceMarkt').val() * (gesamtNutzVonExtern/gesamtNutz)) 
            );
        });
        $('#priceMarkt').unbind();

        const changepriceMarkt = function() {
            $('#priceNutz').val((
                ($('#priceErz').val() * (gesamtNutzVonIntern/gesamtNutz)) +  
                ($('#priceMarkt').val() * (gesamtNutzVonExtern/gesamtNutz)) 
            ).toFixed(2));
            $('#priceErz').val((
                ($('#priceNutz').val() * (gesamtErzAnIntern/gesamtErz)) +  
                ($('#priceMarkt').val() * (gesamtErzAnExtern/gesamtErz)) 
            ).toFixed(2));
        }

        $('#priceMarkt').on('change',changepriceMarkt);
        $.getJSON("https://api.corrently.io/v2.0/gsi/marketdata?zip=69256",function(d) {
            $('#priceMarkt').val(d.data[0].marketprice);
            changepriceMarkt();
        })
    })
    
})