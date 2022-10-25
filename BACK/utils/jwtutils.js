// imports
var jwt = require('jsonwebtoken');
const JWT_SIGN_SECRET = "5cdk543regerg4bre64gbvre4gb654ergggjhejheuhiucug5";

// exported function
module.exports = {
    generateTokenForUser: function(userData) {
        return jwt.sign({
            userId: userData.id,
            isAdmin: userData.isAdmin
        },
        JWT_SIGN_SECRET,
        {
           expiresIn: '15h' 
        })
    },

    parseAuthorization: function(authorization) {
        return (authorization != null) ? authorization.replace('Bearer ', '') : null;
    },

    getUserId: function(authorization) {
        var userid = -1;
        var token = module.exports.parseAuthorization(authorization);
        console.log('---hola---',token)
        if(token != null) {
          try {
            var jwtToken = jwt.verify(token, JWT_SIGN_SECRET);
            if(jwtToken != null) userid = jwtToken.userId;
          } catch(err) { }
        }
        return userid;
    }  
}