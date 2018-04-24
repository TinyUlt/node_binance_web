var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(express.static('public'));

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
let dbName = "br112";
var dbase;
MongoClient.connect(MONGODB, function(err, db) {
    assert.equal(null, err);
    console.log('Connected correctly to server.');
    dbase = db.db(dbName);
    // dbase.createCollection('site', function (err, res) {
    //     assert.equal(null, err);
    //     console.log("创建集合!");
    //     db.close();
    // });
});
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

    if(pathName == "a"){
        var query = {};
        let timeType = req.query.timeType;
        let startTime =parseInt(req.query.startTime);
        let endTime =parseInt( req.query.endTime);
        let symbol = req.query.symbol;
        find(symbol, startTime, endTime, response);
    }else if(pathName == "b"){

        getRobotInfo(response);
    }



}
function getRobotInfo(response){
    dbase.collection("info"). find({_id:0}).toArray(function(err, result) { // 返回集合中所有数据
        if (err) throw err;

        response.end(JSON.stringify(result[0]));
    });
}
function find(collectionName, startTime,endTime,  response){
    let project = {};
    project["_id"] = 1;
    project["ask"] = 1;
    project["bid"] = 1;
    project["usdtBtcPrice"] = 1;
    project["sellDonePrice"] = 1;


    dbase.collection(collectionName). find({_id:{$gt:startTime,$lt:endTime}}).project(project).sort({_id:1}).toArray(function(err, result) { // 返回集合中所有数据
        if (err) throw err;

         response.end(JSON.stringify(result));
    });
}
var server = app.listen(80, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log("应用实例，访问地址为 http://%s:%s", host, port)

});