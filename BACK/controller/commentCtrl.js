const models = require("../models");
const asyncLib = require("async");
const jwtUtils = require("../utils/jwtUtils");
const { getUserId } = require("../middleware/auth.middleware");

module.exports = {
  createComment: (req, res) => {
    var headerAuth = req.headers["authorization"];
    //decrypt token and get user id
    var userId = jwtUtils.getUserId(headerAuth);
    console.log("---------------", userId);
    let postId = req.body.postId;
    let content = req.body.content;

    console.log(postId);
    if (content == "") {
      res.status(400).send({
        error: "impossible de publier un commentaire vide !",
      });
    }
    models.comment
      .create({
        userId: userId,
        postId: postId,
        content: content,
      })
      .then((comment) =>
        res.status(200).json({
          successCom: "votre commentaire est créé !",
          comment,
        })
      )
      .catch((error) => {
        console.log(error);
        res.status(400).json({
          error: "impossible de créer un commentaire",
        });
      });
  },

  getAllComment: (req, res) => {
    // Parameters
    models.comment
      .findAll({
        attributes: [
          "id",
          "userId",
          "postId",
          "content",
          "createdAt",
          "updatedAt",
        ],
      })
      .then((data) => {
        if (data) {
          res.status(200).send(data);
        }
      })
      .catch((err) => {
        res.status(400).send({
          message:
            err +
            "Une erreur s'est produite : lors de la récupération des posts.",
        });
      });
  },

  updateComment: function(req,res) {
    let headerAuth =req.headers['authorization'];
    let userId =jwtUtils.getUserId(headerAuth);

    let postId =req.params.postId;
    let commentId =req.params.commentId;
    let content = req.body.content;

    if(postId <= 0){
        return res.status(400).json({error: "Paramètres invalides" });
    }
    models.post.findOne({
        where: { id: postId }
    })
    .then(function(postFound){
        if(postFound) {
            models.user.findOne({
                where: { id: userId }
            })
            .then(function(userFound){
                if(userFound) {
                    models.comment.findOne({
                        where: {
                            id: commentId,
                            postId: postId,
                         }
                    })
                    .then(function(commentFound){
                      if(commentFound) {
                        console.log("---------------- COMMENT FOUND ----------------", commentFound)
                          if(commentFound.dataValues.userId == userFound.id){
                              commentFound.update({
                                  content : ( content ? content : commentFound.content)
                              })
                              return res.status(200).json({success: "Votre commentaire a été mit à jour" });
                          }else {
                              return res.status(403).json({error: "Vous n'avez pas les droits de modifier ce commentaire" });
                          }
                      }else {
                          return res.status(404).json({error: "Commentaire introuvable" });
                      }
                  })
                  .catch(function(error){
                      return res.status(500).json({error: "Impossible de trouver le commentaire" });
                  })
              }else {
                  return res.status(403).json({error: "Utilisateur invalide" });
              }
          })
          .catch(function(error){
            return res.status(500).json({error: "unable to verify user" });
        })
      }else {
          return res.status(404).json({error: "Publication introuvable" });
      }
  })
  .catch(function(error){
      return res.status(500).json({error: "Impossible de trouver la publication" });
  })

  },

  deleteComment: async (req, res) => {
    let headerAuth = req.headers["authorization"];
    console.log(headerAuth);
    let userlog = jwtUtils.getUserId(headerAuth);

    const postId = req.params.postId;
    const commentId = req.params.commentId;

    models.user.findOne({
        where: { id: userlog },
      })
      .then((userFound) => {
        if (userFound) {
          models.post.findOne({
              where: { id: postId },
            })
            .then((postFound) => {
              if (postFound) {
                models.comment.findOne({
                    where: {
                      id: commentId,
                      postId: postFound.id,
                      userId: userFound.id,
                    },
                  })
                  .then((commentFound) => {
                    if (commentFound) {
                      if (commentFound.dataValues.userId === userFound.id)
                        models.comment.destroy({
                          where: { id: commentId },
                        });
                      return res
                        .status(200)
                        .json({ succes: "Commentaire supprimé" });
                    } else {
                      return res
                        .status(400)
                        .json({ error: "Commentaire introuvable" });
                    }
                  })
                  .catch();
              } else {
                return res
                  .status(400)
                  .json({ error: "Publication introuvable" });
              }
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          return res.status(400).json({ error: "Utilisateur introuvable" });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  },
};
