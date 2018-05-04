let fs = require('fs');
let path = require('path');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
let DATABASE_EX = process.env.DATABASE_EX;
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var SYMBOL = process.argv[2];
app.use(express.static('public'));
// writePrice({a:"aaa",b:"bbb"});
app.get('/index.htm', function (req, res) {
    res.sendFile( __dirname + "/" + "index.htm" );
})

app.get('/process_get', function (req, res) {

    // 输出 JSON 格式
    var response = {
        "first_name":req.query.first_name,
        "last_name":req.query.last_name
    };
    console.log(response);
    res.end(JSON.stringify(response));
})

app.get('/d_*', function (req, res) {

     find(req.params['0'], req, res );
})
app.post('/process_post', urlencodedParser, function (req, res) {

    // 输出 JSON 格式
    var response = {
        "first_name":req.body.first_name,
        "last_name":req.body.last_name
    };
    console.log(response);
    res.end(JSON.stringify(response));
})
app.post('/d_*', urlencodedParser, function (req, res) {

    handle(req.params['0'], req, res );
})
const moment = require('moment');

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

let MONGODB = process.env.MONGODB;
let dbaseName = SYMBOL + "_" +DATABASE_EX;
var dbchartName = SYMBOL + "_Chart";
let dbchart;
MongoClient.connect(MONGODB, function(err, db) {
    assert.equal(null, err);
    console.log('Connected correctly to server.');
    dbase = db.db(dbaseName);
    dbchart = db.db(dbchartName);
    // dbase.createCollection('site', function (err, res) {
    //     assert.equal(null, err);
    //     console.log("创建集合!");
    //     db.close();
    // });
    setTimeout(updatePrice, 1000);
});
function updatePrice(){
    dbase.collection("t_1s").aggregate([
        {$group:{_id:null,tick:{'$last':'$_id'}, ask:{'$last':'$ask'},bid:{'$last':'$bid'}}},//1分钟线

    ]).toArray(function(err, res) {

        writePrice(res[0]);

    });
    setTimeout(updatePrice, 1000);
}

function writePrice(data){
    let w_data = new Buffer( JSON.stringify(data));

    fs.writeFile("public/price", w_data, function (err) {
        if(err) {
            console.error(err);
        } else {
            console.log('写入成功');
        }
    });

}
function getDateString(){
    let today=new Date();
    return today.getFullYear()+"_" + (today.getMonth() + 1) + "_" + today.getDate();
}
function getDataValue(){
    let today=new Date();
    return today.valueOf();
}
function JSONLength(obj) {
    let size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
function DeleteId(arr) {
    for(var i=0,flag=true,len=arr.length;i<len;flag ? i++ : i){

        if( arr[i]&&JSONLength(arr[i])==1 ){
            arr.splice(i,1);
            flag = false;
        } else {
            flag = true;
        }

    }
}
function handle(pathName, req, response) {

    console.log(pathName);

    if(pathName === "a"){

        let startTime =parseInt(req.query.startTime);
        let endTime =parseInt( req.query.endTime);
        let symbol = req.query.symbol;

        getAsksBids(symbol, startTime, endTime, response);
    }
    if(pathName === "b"){
        var query = {};
        let timeType = req.query.timeType;
        let startTime =parseInt(req.query.startTime);
        let endTime =parseInt( req.query.endTime);
        let symbol = req.query.symbol;
        let where = req.query.where;
        getRobot(symbol,where, startTime, endTime, response);
    }
    if(pathName === "c"){

        getRobotInfo(response);
    }
    if(pathName === "d"){

        let startTime =parseInt(req.query.startTime);
        let endTime =parseInt( req.query.endTime);
        let symbol = req.query.symbol;

        getAvg(symbol, startTime, endTime, response);
    }



}
function getRobotInfo(response){
    dbase.collection("info"). find({_id:0}).toArray(function(err, result) { // 返回集合中所有数据
        if (err) throw err;

        response.end(JSON.stringify(result[0]));
    });
}
function getAsksBids(collectionName, startTime,endTime,  response){

    console.log(collectionName);
    dbchart.collection(collectionName). find({_id:{$gt:startTime,$lt:endTime}}).sort({_id:1}).toArray(function(err, result) { // 返回集合中所有数据
        if (err) throw err;

        response.end(JSON.stringify(result));
    });
}

function getRobot(collectionName, where, startTime,endTime,  response){
    let project = {};
    project["_id"] = 0;
    project[where] = 1;
    project["currencyPerGoodsIn"] = 1;
    project["currencyPerGoodsInReal"] = 1;
    project["currencyPerGoodsOut"] = 1;
    project["nodeId"] = 1;
    project["currencyPerGoodsIn"] = 1;
    project["currencyPerGoodsCost"] = 1;
    project["highst"] = 1;
    project["currencyPerGoodsPreSale"] = 1;

    // project["sellDonePrice"] = 1;
    // project["nodeId"] = 1;
    // project["highst"] = 1;
    // project["usdtEarn"] = 1;
    // project["readySellPrice"] = 1;
    // project["currencyPerGoodsPreSale"] = 1;

    dbase.collection(collectionName). find({[where]:{$gt:startTime,$lt:endTime}, managerId:0}).project(project).sort({[where]:1}).toArray(function(err, result) { // 返回集合中所有数据
        if (err) throw err;

         response.end(JSON.stringify(result));
    });
}
function getAvg(collectionName, startTime,endTime,  response){
    console.log(collectionName);
    dbchart.collection(collectionName). find({_id:{$gt:startTime,$lt:endTime}}).sort({_id:1}).toArray(function(err, result) { // 返回集合中所有数据
        if (err) throw err;

        response.end(JSON.stringify(result));
    });
}
var server = app.listen(8083, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log("应用实例，访问地址为 http://%s:%s", host, port)

});