const bcrypt = require('bcrypt');
const models = require('../models');
var asyncLib = require('async');
var jwtUtils = require ('../utils/jwtUtils');

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{4,}$/;

module.exports = {

  createUser: (req,res) => {
    //parameters
  
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    let attachment = req.body.attachment;
    let bio = req.body.bio;
    
    if( username == '' || email == '' || password == ''){
        return res.status(400).json({'error': 'champs vides'})
    };
    if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ 'error': 'email invalide' });
    };
    if (!PASSWORD_REGEX.test(password)) {
        return res.status(400).json({ 'error': 'Mot de passe invalide (doit contenir au moins: 1 majuscule, 1 miniscule, 1 chiffre et 1 caractère special)' });
    }
    //waterfall
    asyncLib.waterfall([
      (done)=> {
          models.user.findOne({                       // cherche si l'utilisateur existe déjà
            attributes: ['email'],
            where: { email: email }
          })
          .then((userFound)=> {
            done(null, userFound);
          })
          .catch((err)=> {
            return res.status(500).json({ 'error': 'impossible de vérifier l\'utilisateur' });
          });
      },

      (userFound, done) =>{
          if (!userFound) {
            bcrypt.hash(password, 5, function( err, bcryptedPassword ) {
              done(null, userFound, bcryptedPassword);
            });
          } else {
            return res.status(409).json({ 'error': 'ce compte existe déjà' });
          }
      },

      (userFound, bcryptedPassword, done)=> {
          var newUser = models.user.create({            // Créer un compte (si l'email n'exsite pas déjà dans la base de données)
            email: email,
            password: bcryptedPassword,
            username: username,
            attachment: attachment,
            bio : bio,
            
          })
          .then(function(newUser) {
            done(newUser);
          })
          .catch(function(err) {
            console.log("-------------- ICI ERREUR --------------",err)
            return res.status(500).json({ 'error': 'erreur lors de la création du compte' });
          });
      }

    ],(newUser) =>{
        if (newUser) {
          return res.status(201).json({'message': 'Compte crée avec succès', newUser});
        } else {
          return res.status(500).json({ 'error': 'erreur 123' });
        }
    });  
  },
    
  getUserId: (req, res) => {
      let headerAuth = req.headers['authorization'];
      let userLoggedId = jwtUtils.getUserId(headerAuth);
      let userId = req.params.id;

    models.user.findOne({
       where: { id : userLoggedId }
    })
    .then(function(userLoggedFound) {
    if(userLoggedFound) {
    models.user.findOne({
      attributes: ["id", "email", "username", "attachment", "bio"],
      where: { id: userId }
    })
    .then(function(userFound) {
      if (userFound) {
        return res.status(200).json({ success: userFound });
      } else {
        return res.status(404).json({ error: "Utilisateur non introuvable" });
      }
    })
    .catch(function(error) {
        return res.status(500).json({ error: "Ne peut pas récupérer l'utilisateur" });
    })
      } else {
        return res.status(403).json({ error: "Utilisateur invalide" });
      }
      })
      .catch(function(error) {
        return res.status(500).json({ error: "Ne peut pas vérifier l'utilisateur" });
      })
  },
    
  login: function (req, res){

      // params
      var email = req.body.email;
      var password = req.body.password;

      if (email == '' || password == '') {
          return res.status(400).json({ 'error': 'Paramètre(s) manquant(s)'});
      }

      // verify  var
      asyncLib.waterfall([
          function(done) {
            models.user.findOne({
              where: { email: email }
            })
            .then(function(userFound) {
              done(null, userFound);
            })
            .catch(function(err) {
              return res.status(500).json({ 'error': 'Impossible de vérifier l\'utilisateur' });
            });
          },
          function(userFound, done) {
            if (userFound) {
              bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt) {
                done(null, userFound, resBycrypt);
              });
            } else {
              return res.status(404).json({ 'error': 'Le compte n\'existe pas dans la base de données' });
            }
          },
          function(userFound, resBycrypt, done) {
            if(resBycrypt) {
              done(userFound);
            } else {
              return res.status(403).json({ 'error': 'Mot de passe invalide' });
            }
          }
        ], function(userFound) {
          if (userFound) {
            return res.status(201).json({
              'userId': userFound.id,
              'token': jwtUtils.generateTokenForUser(userFound)
            });
          } else {
            return res.status(500).json({ 'error': 'Ne peut pas connecter le compte' });
          }
        });
  },

  getAllUsers: (req, res) => {
        models.user.findAll({
            attributes: [ 'id', 'email', 'username', 'attachment', 'bio']
            })
        .then(data => {
            if (data) {
                res.status(200).send(data);
            }
        })
        .catch(err => {
            res.status(400).send({
                message: "Une erreur s'est produite : lors de la récupération des utilisateurs."
            });
        });
  },
    
  putUser: function(req, res) {

        let headerAuth = req.headers['authorization'];
        let userId = jwtUtils.getUserId(headerAuth);
        
        // Params
        
        let username = req.body.username;
        let attachment = req.body.attachment;
        let bio = req.body.bio;
        
        asyncLib.waterfall([
            function(done) {
            models.user.findOne({
                attributes: ['id', 'username','email', 'attachment', 'bio'],
                where: { id: userId }
            }).then(function (userFound) {
                done(null, userFound); // <= utilisateur trouvé !
            }).catch(function(err) {
                console.log(err)
                return res.status(500).json({ 'error': 'Impossible de trouver l\'utilisateur' });
            });
        },
            function(userFound, done) { // <= si utilisateur trouvé :)

            if(userFound) {
              console.log(userFound);
                userFound.update({
                
                username : (username ? username : userFound.username), // <= modifie le nom de l'utilisateur s'il a décidé de le changer 
                attachment : (attachment ? attachment : userFound.attachment),
                bio : (bio ? bio : userFound.bio),

                }).then(function() {
                    done(userFound);
                }).catch(function(err) {
                    res.status(500).json({ 'error': 'Impossible de mettre à jour le compte' });
                });
            } else {
                res.status(404).json({ 'error': 'utilisateur non trouvé' });
            }
            },
        ], function(userFound) {
            if (userFound) {
                return res.status(200).json({ 'success': 'Compte mit à jour avec succès', userFound });
            } else {
                return res.status(500).json({ 'error': 'Impossible de mettre à jour le profil du compte' });
            }
        });
  },
    
  deleteUser : async (req, res) => {
      let headerAuth = req.headers['authorization'];
      let userId = jwtUtils.getUserId(headerAuth);

      models.user.findOne({
        where:{id:userId}
      })
      .then((userFound)=> {
        if(userFound){
          models.user.destroy({
            where:{id:userId}
          })
          return res.status(200).json({success:"Utilisateur supprimé"})
        }else {
          return res.status(404).json({error:"Utilisateur non trouvé"})
        }
      })
      .catch((err)=>{console.log(err)})
  },

  getMe: (req, res) => {
      let headerAuth = req.headers['authorization'];
      let userId = jwtUtils.getUserId(headerAuth);
      if (userId < 0) {
       return res.status(400).json({ error: "utilisateur non connecté" });
      }
      models.user.findOne({
        attributes: ["id", "email", "username", "attachment", "bio"],
        where: { id : userId }
      })
      .then(function(user) {
        if (user) {
          return res.status(200).json({success : user});
        } else {
          return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
      })
      .catch(function(error) {
        return res.status(500).json({ error: "Ne peut pas récupérer l'utilisateur" });
      })
  },
}

