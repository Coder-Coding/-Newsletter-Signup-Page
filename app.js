
const express =require("express");
const bodyparser = require("body-parser");
// const requests = require("request");
const https = require("https"); // it is used to transfer data from our site to the mailchimp.
const config = require("./config");

const app = express();

app.use(bodyparser.urlencoded({extended:true}));

// since our custom style sheet and image is local we have to use a function to make server serve the local files from our device.
app.use(express.static("public")) //provided the path of our static file.

app.get("/",function(req,res){
    console.log("<h1>hello</h1>");
    res.sendFile(__dirname+"/signup.html");
})

app.post("/",function(req,res){
    console.log(req.body)
    var first = req.body.fname;
    var second = req.body.sname;
    var em = req.body.email;

    //mailchimp takes the data in json format so we will first create java script object then convert it into json format
    var data={
        members:[
            {
                email_address: em,
                status:"subscribed",
                merge_fields:{
                    FNAME: first,
	                LNAME: second,
                }
            }
        ],
    };


    //converting object to flatpack jason
    const jsonfile = JSON.stringify(data);

    //https.get(url,function(req,res)) -----> this only gets the data from external resource.


    const url = `https://us10.api.mailchimp.com/3.0/lists/${config.listId}`;

    const option={
        method: "POST",

        //authentication using https
        //"any user name: api key[password]" specified by mail chimp.
        auth:`king:${config.mailchimpAPIKey}`,
    }
    //now we have to post data to the external resource 
    const sendingDataToChimp = https.request(url,option,function(response){ //going to store response from mailchimp wheather the transfer was successful or not.

        //getting status code from response
        console.log(response.statusCode);
        //
        const status = response.statusCode;

        if(status === 200){
            res.sendFile(__dirname+"/success.html");
            // res.send("success");
        }
        else{
            res.sendFile(__dirname+"/failure.html");
            // res.send("fail");
        }

        response.on("data",function(data){
            console.log(JSON.parse(data));
        })
    })
    
    sendingDataToChimp.write(jsonfile);

    //specify that the process is done by telling
    sendingDataToChimp.end();
})

//going back to the main page
app.post("/failure",function(req,res){
    res.redirect("/");
})

app.post("/success",function(req,res){
    console.log(req);
    res.redirect("/");
})

// app.listen(3000,()=>{
//     console.log("server is running on port 3000");
// }) show the port we are listining to is given by us locally but heroku will give port according to its system 


//process.env.PORT defined by heroku
//now our app will run on both locally and heroku system
app.listen(process.env.PORT || 3000,()=>{
    console.log("server is running on port 3000");
});
