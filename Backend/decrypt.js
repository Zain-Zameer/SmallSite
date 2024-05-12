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
const crypto = require('crypto');
function decryptData(encryptedData, key) {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

sql.connect(config, function(err) {
    if (err) {
        console.log(err);
    } else {
        let username = "zainzameer";
        var request = new sql.Request();    
        request.input('username', sql.NVarChar, username);
        request.query(`SELECT password FROM personal.zenzen where username=@username`, function(err, records) {
                data = records.recordset[0].password;
                encryptionKey = "zenzencompany";
                const decryptedData = decryptData(data, encryptionKey);
                console.log(decryptedData)
            
        });
    }
});
