const models = require('../models');
const asyncLib = require('async');
const jwtUtils = require ('../utils/jwtUtils');
const { getUserId } = require('../middleware/auth.middleware');

module.exports = {

    createPost: (req, res) => {

        var headerAuth   = req.headers['authorization'];
        //décrypte le token et récupère l'id de l'utilisateur
        var userId  = jwtUtils.getUserId(headerAuth);
        
        let content = req.body.content;
        let attachment = req.body.attachment;
        // let likeCount = req.body.likeCount;

        if (userId < 0)
            return res.status(400).json({ 'error': 'mauvais token' });
        // Vérification des champs
        if (content == "" && attachment == "") {
            return res.status(400).json({'error': 'Une erreur s\'est produite : content ET attachment sont vides !'});
        }   
        
           // Waterfall
           asyncLib.waterfall([
            (done) => {
                let newPost = models.post.create({
                    userId: userId,
                    content: content,
                    attachment: attachment,
                    likeCount: 0,
                })
                .then((newPost) => {
                    done(newPost);
                })
                .catch((err) => {
                    console.log("------------ ERROR POST -----------",err)
                    return res.status(500).json({'error': 'bug serveur : incapacité à créer des posts :('})
                });
            }
        ],
        (newPost) => {
            if(newPost) {
                return res.status(201).json({ 'postId': newPost.id, success: 'Post créer avec succès! :)'
                })
            }
        })
    },

    getAllPost: (req, res) => {
        // Parameters
        models.post.findAll({
            attributes: [ 'id', 'userId', 'content', 'attachment', 'likeCount', 'createdAt', 'updatedAt']
            })
        .then(data => {
            if (data) {
                res.status(200).send(data);
            }
        })
        .catch(err => {
            res.status(400).send({
                message: err + "Une erreur s\'est produite : lors de la récupération des posts."
            });
        });
    },

    updatePost : (req, res) => {
        var headerAuth   = req.headers['authorization']
        let posterId = jwtUtils.getUserId(headerAuth);

        let content = req.body.content;
        let attachment = req.body.attachment;
        let postId = req.params.id

            asyncLib.waterfall([
            function(done) {
                models.post.findOne({
                    where: { id: postId }
                }).then(function (postFound) {
                    done(null, postFound); // <= post trouvé !
                }).catch(function(err) {
                    console.log(err)
                    return res.status(500).json({ 'error': 'Impossible de trouver l\'utilisateur' });
                });
                },
                function(postFound, done) { // <= si post trouvé :)

                    if(postFound) {
                    console.log(postFound);
                        postFound.update({
                        
                        content : (content ? content : postFound.content), // <= modifie le texte du post s'il a décidé de le changer 
                        attachment : (attachment ? attachment : postFound.attachment) // <= modifie l'image du post s'il a décidé de la changer 
                        
                        }).then(function() {
                            done(postFound);
                        }).catch(function(err) {
                            res.status(500).json({ 'error': 'Impossible de mettre à jour le post' });
                        });
                    }   else {
                            res.status(404).json({ 'error': 'post non trouvé' });
                        }
                },
            ], (postFound) => {
                if (postFound) {
                    return res.status(200).json({ 'message': 'Post mit à jour avec succès', postFound });
                } else {
                    return res.status(500).json({ 'error': 'Impossible de mettre à jour le post' });
                }
            });
    },
  
    deletePost : async (req, res) => {
        let headerAuth = req.headers['authorization'];
        console.log(headerAuth)
        let posterId = jwtUtils.getUserId(headerAuth);
        console.log(posterId)
        const postId = req.params.id
  
        models.post.findOne({
            attributes: [
                'id', 'userId', 'content', 'attachment'
            ],
          where:{id: postId}
        })
        .then((postFound) => {
          if(postFound && postFound.userId === posterId){
            postFound.destroy()
            .then(() => res.status(200).json({success:"Post supprimé"}))
            .catch((err) => console.log(err))
          }else {
            return res.status(404).json({error:"Post introuvable"})
          }
        })
        .catch((err)=>{console.log(err)})
    },

    
 //   getPost: (req, res) => {
    //     var userId = req.params.id;
        
    //     models.post.findOne({
    //         attributes: ['id', 'content'],
    //         where: {id: userId}
    //     })
    //     .then((user) => {
    //         if(user){
    //             res.status(201).json(user)   
    //         }
    //         else {
    //             res.status(404).json({'error': 'Publication not found'})
    //         }
    //     })
    //     .catch((err) =>  {
    //       console.log(err)
    //         res.status(500).json({'error': 'Cannot fetch Publication'});
    //     })
    // },



    // uploadProfil : async (req, res) => {
    //     const token = req.cookies.jwt;
    //     const userId = getUserId(token);
    //     const picture = req.file.filename;

    //     try {
    //         await UserModel.upload(
    //             userId,
    //             { $set: { picture: picture } },
    //             { new: true, upsert: true, setDefaultsOnInsert: true })
    //             .then((data) => res.send(data))
    //             .catch((err) => res.status(500).send({ message: err }));
                
    //         } catch (err) {
    //         console.log(err);
    //         return res.status(500).send({ message: err });
    //         }
    // },
}
