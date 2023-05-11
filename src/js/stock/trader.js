const axios = require("axios");
let dt = 1000;

exports.start = ()=>{
    console.log("Trader started.")
    loop();
}

async function loop(){
    getHistory("hcdi", /*Math.round(new Date("2023-05-01T12:00").getTime()/1000)*/Math.round(Date.now()/1000)-604800, Math.round(Date.now()/1000), "1m");
    //setTimeout(loop, dt);
}

async function getHistory(symbol, start, end, interval){
    const res = await axios.request({
        method:"GET",
        url:"https://query2.finance.yahoo.com/v8/finance/chart/"+symbol, //+"?period1="/*1674885600*/+start+"&period2="+/*1675404000*/end+"&interval="+interval,
        params:{
            period1:start,
            period2:end,
            interval
        }
    });
    console.log(res.request.res.responseUrl)
    console.log(res.data.chart.result[0].indicators.quote);
}