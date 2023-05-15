const axios = require("axios");
let dt = 60000;
let currentDay = new Date().getDate();
let history = {};

exports.start = ()=>{
    console.log("Trader started.");
    //require("./test").start();
    startloop();
}

async function startloop(){
    //hcdi
    let newHistory = await getHistory("HCDI", /*Math.round(new Date("2023-05-01T12:00").getTime()/1000)*/Math.round(Date.now()/1000)-604800, Math.round(Date.now()/1000), "1m", "high");
    appendToHistory("HCDI", newHistory);
    let res = await train("HCDI",6);
    let trendnum = res.trendnum;
    let trendsup = res.trendsup;
    let money = res.money;
    let amtin = 0;
    let prevPrice = await getPrice("HCDI");
    console.log("Start: "+money)
    let currentTrend = res.currentTrend;
 
    let justBought = false;
    setTimeout(loop, dt);
    async function loop(){
        console.log("New Loop:");
        let hour = new Date().getHours();
        let min = new Date().getMinutes();
        let day = new Date().getDay();
        if(day != 0 && day != 6 && (hour < 17 && (hour > 10 || (hour == 10 && min > 30)))){
            const price = await getPrice("HCDI");
            console.log("Difference: " + (price - prevPrice));
            if(price == prevPrice){
                console.log("Same price.");
            }else{
                let str = "";
                if(price == prevPrice){
                    str=("level");
                }else if(price > prevPrice){
                    str=("up");
                }else{
                    str=("down");
                }
                if(currentTrend.length < trendnum){
                    currentTrend.push(str);
                }else{
                    for(let t = 0; t < currentTrend.length; t++){
                        if(t == currentTrend.length - 1){
                            currentTrend[t] = str;
                        }else{
                            currentTrend[t] = currentTrend[t+1];
                        }
                        
                    }
                }
                let boughtin = false;
                for(let t = 0; t < trendsup.length; t++){
                    if(JSON.stringify(currentTrend) == JSON.stringify(trendsup[t].trend)){
                        justBought = true;
                        boughtin = true;
                        //amtin += trendsup[t].timesseen;
                        console.log("Buying everything.")
                        amtin += Math.floor(money/price);
                        money -= price*Math.floor(money/price);
                        
                    }
                }
                if(!boughtin && justBought){
                    console.log("Selling everything.")
                    justBought = false;
                    money += price*amtin;
                    amtin = 0;
                }
            }
            prevPrice = price;
            console.log("Current money: "+money + "\n");
            
        }else{
            console.log("Trading not open.");
        }
        if(currentDay != new Date().getDate()){
            currentDay = new Date().getDate();
            exports.start();
        }else{
            setTimeout(loop, dt);
        }
        
    }
}

async function getPrice(symbol){
    return (await axios.request({
        method:"GET",
        url:"https://query2.finance.yahoo.com/v8/finance/chart/"+symbol, //+"?period1="/*1674885600*/+start+"&period2="+/*1675404000*/end+"&interval="+interval,
    })).data.chart.result[0].meta.regularMarketPrice;
}

async function getHistory(symbol, start, end, interval, selection){
    const res = await axios.request({
        method:"GET",
        url:"https://query2.finance.yahoo.com/v8/finance/chart/"+symbol, //+"?period1="/*1674885600*/+start+"&period2="+/*1675404000*/end+"&interval="+interval,
        params:{
            period1:start,
            period2:end,
            interval
        }
    });
    if(!history[symbol]){
        history[symbol] = [];
    }
    return (res.data.chart.result[0].indicators.quote[0][selection].filter((i)=>{return i}));
}

function train(symbol, n){
    let increases = [];
    let decreases = [];
    let trends = [];
    let trendsdown = [];
    for(let i = 1; i < history[symbol].length; i++){
        let price = history[symbol][i];
        let lastprice = history[symbol][i - 1];
        if(price - lastprice > 0){
            increases.push(price - lastprice);
        }else if(lastprice - price > 0){
            decreases.push(lastprice - price);
        }
    }
    const daverage = (averageOfNumList(decreases));
    const iaverage = (averageOfNumList(increases));
    for(let i = 10; i < history[symbol].length; i++){
        let slist = history[symbol];
        let price = slist[i];
        let lastprice = slist[i - 1];
        let deriv = Math.abs(price - lastprice);
        if(price - lastprice > 0){
            if(deriv > iaverage){
                let arr = ({timesseen: 1, trend:[]});
                for(let t = n; t > 0; t--){
                    let price = Math.round(slist[i - t]*100)/100;
                    let prevprice = Math.round(slist[i - t - 1]*100)/100;
                    if(price == prevprice){
                        arr.trend.push("level");
                    }else if(price > prevprice){
                        arr.trend.push("up");
                    }else{
                        arr.trend.push("down");
                    }
                }
                let found = false;
                for(let t = 0; t < trends.length; t++){
                    if(JSON.stringify(trends[t].trend) == JSON.stringify(arr.trend)){
                        trends[t].timesseen++;
                        found = true;
                    }
                }
                if(!found){

                    trends.push(arr);
                }
            }
        }else{
            if(deriv > daverage){
                let arr = ({timesseen: 1, trend:[]});
                for(let t = n; t > 0; t--){
                    let price = Math.round(slist[i - t]*100)/100;
                    let prevprice = Math.round(slist[i - t - 1]*100)/100;
                    if(price == prevprice){
                        arr.trend.push("level");
                    }else if(price > prevprice){
                        arr.trend.push("up");
                    }else{
                        arr.trend.push("down");
                    }
                }
                let found = false;
                for(let t = 0; t < trendsdown.length; t++){
                    if(JSON.stringify(trendsdown[t].trend) == JSON.stringify(arr.trend)){
                        trendsdown[t].timesseen++;
                        found = true;
                    }
                }
                if(!found){

                    trendsdown.push(arr);
                }
            }
        }
    }
    trendsdown = trendsdown.filter((i)=>{
        return i.timesseen > 2;
    });
    trends = trends.filter((i)=>{
        return i.timesseen > 2;
    });
    const res = emulate(trends, trendsdown, history[symbol], 100, n);
    let money = res.money;
    let currentTrend = res.currentTrend;
    const retval = {money, trendsup:trends, trendsdown, currentTrend, trendnum:n,data:history[symbol]};
    return retval;
}

function emulate(trendsup, trendsdown, data, startmoney, trendnum){
    let money = startmoney;
    let currentTrend = [];
    let amtin = 0;
    let justBought = false;
    for(let i = 10; i < data.length; i++){
        let price = data[i];
        let prevprice = data[i - 1];
        let str = "";
        if(price == prevprice){
            str=("level");
        }else if(price > prevprice){
            str=("up");
        }else{
            str=("down");
        }
        if(currentTrend.length < trendnum){
            currentTrend.push(str);
        }else{
            for(let t = 0; t < currentTrend.length; t++){
                if(t == currentTrend.length - 1){
                    currentTrend[t] = str;
                }else{
                    currentTrend[t] = currentTrend[t+1];
                }
                
            }
        }
        let boughtin = false;
        for(let t = 0; t < trendsup.length; t++){
            if(JSON.stringify(currentTrend) == JSON.stringify(trendsup[t].trend)){
                justBought = true;
                boughtin = true;
                //amtin += trendsup[t].timesseen;
                amtin += Math.floor(money/data[i]);
                money -= data[i]*Math.floor(money/data[i]);
                
            }
        }
        if(!boughtin && justBought){
            justBought = false;
            money += data[i]*amtin;
            amtin = 0;
        }

    }
    return {money, currentTrend};
}

function appendToHistory(symbol, newHistory){
    if(!history[symbol]){
        history[symbol] = [];
    }
    history[symbol] = [...history[symbol], ...newHistory];
}

function averageOfNumList(list){
    let sum = 0;
    for(let i = 0; i < list.length; i++){
        sum += list[i];
    }
    return sum/list.length;
}