const  express =require('express');
const  path =require('path');
const app = express();

const sql= require("mssql/msnodesqlv8");
var config = {
    server :"DESKTOP-IRSO487\\SQLEXPRESS",
    database : "person",
    driver:"msnodesqlv8",
    options:{
        trustedConnection:true,
        userName: "personal", 
        password: "setting"
    }
}



// What the hack is this 
const bodyParser = require('body-parser');
const crypto = require('crypto');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true}));





app.use(express.static(path.join(__dirname, '../public')));
// let DataBaseRecords = [];
// sql.connect(config,function(err){
//     if(err)console.log(err);
//     var request = new sql.Request();
//     request.query("select History from personal.history",function(err,records){
//         if(err)console.log(err);
//         else{
//             records.recordset.forEach(function(record){
//                 DataBaseRecords.push(record.History);
//             })
//         }
//     });
// })
function  encodedFinalPass(username,key){
    const cipher = crypto.createCipher('aes-256-cbc', key); 
    let encrypted = cipher.update(username, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

app.post('/createAcc.html',function(req,res){
    var username = req.body.takeNewUser;
    var trailPass = req.body.takePassTrial;
    var finalPass = req.body.takePassFinal;
    let key= "zenzencompany";
    if(trailPass === finalPass){
        let encryptedPass  = encodedFinalPass(finalPass,key)
        sql.connect(config,function(err){
            if(err)console.log(err);
            var request = new sql.Request();    
            request.query(`INSERT INTO personal.zenzen VALUES ('${username}','${encryptedPass}') `,function(err,records){
                if(err)console.log(err);
                else{
                    console.log("Data Updated in Sql Server.");
                }
            });
    })
    }
    else{
        console.log("Passwords don't match.");
    }
    
    
});

function decryptData(encryptedData, key) {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
app.get('/api/checkP',function(req,res){
    const usernameCheck = req.query.takeUsername;
    // convert userpasscheck to encrypt and compare
    const userpassCheck = req.query.takePass;

    sql.connect(config, function(err) {
        if (err) {
            console.log(err);
        } else {
            var request = new sql.Request();
            request.input('usernameCheck', sql.NVarChar, usernameCheck);
            request.query(`SELECT password FROM personal.zenzen where username=@usernameCheck`, function(err, records) {

                    data = records.recordset[0].password;
                    encryptionKey = "zenzencompany";
                    let encryptedPass  = encodedFinalPass(userpassCheck,encryptionKey)
                    const decryptedData = decryptData(data, encryptionKey);
                    
                    if(data===encryptedPass){
                        console.log(data + " " + encryptedPass);

                        console.log("Success.");
                    }
                    else{
                        console.log(data + " " + encryptedPass);
                        console.log("Failed.");
                    }
                
            });
        }
    });
    

});

app.get('/api/history',(req,res)=>{
    let movies = [];
    const searchTerm = req.query.search;
    movies.length = 0;
    sql.connect(config,function(err){
            if(err)console.log(err);
            var request = new sql.Request();    
            request.query(`SELECT LOWER(History) AS History FROM personal.history WHERE LOWER(History) LIKE '%${searchTerm.toLowerCase()}%'`,function(err,records){
                if(err)console.log(err);
                else{
                    records.recordset.forEach(function(record){
                        movies.push(record.History);
                    });
                    res.json(movies);
                }
            });
    })
});

// Extract City Names
// app.get('/api/history',(req,res)=>{
//     let movies = [];
//     const searchTerm = req.query.search;
//     movies.length = 0;
//     sql.connect(config,function(err){
//             if(err)console.log(err);
//             var request = new sql.Request();
//             request.query(`SELECT LOWER(History) AS History FROM personal.history WHERE LOWER(History) LIKE '%${searchTerm.toLowerCase()}%'`,function(err,records){
//                 if(err)console.log(err);
//                 else{
//                     records.recordset.forEach(function(record){
//                         movies.push(record.History);
//                     });
//                     res.json(movies);
//                 }
//             });
//     })
// });



app.get('/public/Search.html',(req,res)=>{
    res.sendFile(path.join(__dirname,'../','public','Search.html'));
});
app.get('/public/Weather.html',(req,res)=>{
    res.sendFile(path.join(__dirname,'../','public','Weather.html'));
});
app.get('/public/index.html',(req,res)=>{
    res.sendFile(path.join(__dirname,'../','public','index.html'));
});
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'../','public','index.html'));
});
app.listen(8080,()=>{
    console.log("Server is listening on port 8080");
});