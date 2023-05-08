const express = require("express");
const fs = require("fs");
const app = express();
const port = 80;
const wsport = 8083;
const httpsmode = false;
let clients = {};
let keys = [];

const WebSocket = require("ws"); 
const https = require("https");
const WebSocketServer = WebSocket.WebSocketServer;
let wss;
if(httpsmode){
    const key = fs.readFileSync("certs/privkey.pem");
    const cert = fs.readFileSync("certs/cert.pem");
    const server = https.createServer({key, cert}, app);

    wss = new WebSocketServer({
        server
    });
    server.listen(wsport);
    server.on("listening", ()=>{
        console.log("WS Listening on port " + wsport);
    })
}else{
    wss = new WebSocketServer({
        port:wsport,
    });
    wss.on("listening", ()=>{
        console.log("WS Listening on port " + wsport);
    });
}

wss.on("connection", (ws)=>{
    ws.verified = false;
    ws.uid = generateRandomKey();
    clients[ws.uid] = ws;
    ws.on("message", (msg)=>{
        const data = JSON.parse(msg.toString());
        if(data.req == "auth"){
            const key = data.payload;
            if(keys.includes(key)){
                keys = keys.filter((v)=>{
                    return v !== key;
                });
                ws.verified = true;
                ws.send(JSON.stringify({req:"auth", payload:{success:true}}));
                console.log("New client verified\nID: "+ws.uid);
            }else{
                ws.close();
            }
        }else if(ws.verified){
            procDict[data.req](data.payload, ws);
        }else{
            ws.close();
        }
    });
});
require('dotenv').config();
const mysql = require("mysql");
const con = mysql.createPool({
    host:process.env.ADDRESS,
    database:"CoHanceNetwork",
    password:process.env.PASSWORD,
    user:process.env.sqlUSERNAME,
    connectionLimit: 100
});
const procDict = {
    login: async (cred, ws)=>{
        const ticket = await verifyAuthToken(cred);
        const payload = ticket.payload;
        const name = payload.name;
        const lname = payload.family_name;
        const fname = payload.given_name;
        const email = payload.email;
        const everified = payload.email_verified;
        const gp = payload.picture;
        const iat = payload.iat;
        const exp = payload.exp;
        const jti = payload.jti;
        const sub = payload.sub;
        /*con.query("SELECT * FROM google_users WHERE email = '"+email+"';", (err, res)=>{
            if(err) console.log(err);
            if(res.length > 0){
                
            }
        });*/
        console.log(exp);
    }
};
/*eyJhbGciOiJSUzI1NiIsImtpZCI6Ijc3NzBiMDg1YmY2NDliNzI2YjM1NzQ3NjQwMzBlMWJkZTlhMTBhZTYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYmYiOjE2ODM1MTA1NjIsImF1ZCI6IjQwNTM5MTMyNDc0My10MmpmdTVsbmg5aWJsZGdrYW43YjlpanI1ZWFpbWdtby5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjEwMDE4MzAzMTUyMDMwODgxMDU0MyIsImVtYWlsIjoiYWlkYW50YTAxQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhenAiOiI0MDUzOTEzMjQ3NDMtdDJqZnU1bG5oOWlibGRna2FuN2I5aWpyNWVhaW1nbW8uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJuYW1lIjoiQWlkYW4gQW5kZXJzb24iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUdObXl4YWFPTGt4LVJxaGlfa0NhWkVuTjk4U3FuY3Nqa2lUa3dOOHdhU3Zmdz1zOTYtYyIsImdpdmVuX25hbWUiOiJBaWRhbiIsImZhbWlseV9uYW1lIjoiQW5kZXJzb24iLCJpYXQiOjE2ODM1MTA4NjIsImV4cCI6MTY4MzUxNDQ2MiwianRpIjoiYzFjOWIzNmI4ZGQ4YjU2M2UxNDJjYmVlMmIxOTFhODNlMmJmNjg2NiJ9.c56VmEcfUvwg7KLYBHgc9rIzY3_1NhYr9k6halEzdaE_q3O9wlNRmBQfeYcHwRpedqeXqf128ZbscwyrWBLLC1qfJTnOvXHuIfczEL8NcbbEhaDqf3HPEkUuPgwuq24nW1081VxNgP-6NjlBUVrj1spr9Alh7Ja_ZJLmlhflcMRhxTs0lkDyxUa92flm_ScpIVI97L5O35t1w4o9IWr6s5JnW9jAqtfO4AIIIHV1fpI51XlcaU-7SkGBg7yJDu4lUgZGE2crQ31Meoc2ZIEUnnNnhvTnNszQRZaYpXGKvbSUQF3pO8HXUwI8KOfocVQoL7M8U0OR23R6Ej9_hiVNgA*/
function generateRandomKey(){
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%&~";
    const len = 40;
    let key = "";
    for(let i = 0; i < len; i++){
        key += chars[Math.round(Math.random()*(chars.length - 1))];
    }
    return key;
}

app.set("view engine", "ejs");

app.get("/", (req, res)=>{
    let key = generateRandomKey();
    keys.push(key);
    res.render("../src/views/login.ejs", {
        key
    });
});

app.post("/login", (req, res)=>{
    console.log(req.query);
    res.send(JSON.stringify({success:true}));
});

app.listen(port, ()=>{
    console.log("Listening on port " + port);
});
fs.readdirSync(__dirname+"/img/").forEach((e)=>{
    app.get("/resources/media/img/"+e, (req, res)=>{
        res.sendFile(__dirname+"/img/"+e);
    });
});

async function verifyAuthToken(token){
    let ticket = {};
    try{
        ticket = await client.verifyIdToken({
            audience:"405391324743-t2jfu5lnh9ibldgkan7b9ijr5eaimgmo.apps.googleusercontent.com",
            idToken:token
        });
        if(ticket.name){
            ticket.success = true;
        }else{
            ticket.success = false;
        }
    }catch{
        ticket.success = false;
    }
    
    return (ticket);
}

const {OAuth2Client} = require("google-auth-library");
const client = new OAuth2Client("405391324743-t2jfu5lnh9ibldgkan7b9ijr5eaimgmo.apps.googleusercontent.com");
