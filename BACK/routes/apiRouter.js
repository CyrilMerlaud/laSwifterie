// Imports

const express = require("express");

const userCtrl = require("../controller/userCtrl");
const postCtrl = require("../controller/postCtrl");
const commentCtrl = require("../controller/commentCtrl");
const likeCtrl = require("../controller/likeCtrl");

// router

exports.router = (() => {
    
  let apiRouter = express.Router(); 

    // route.user (CRUD - pour créer des routes)
    
    apiRouter.route('/register').post(userCtrl.createUser); // OK <= créer un utilisateur 
    apiRouter.route('/login').post(userCtrl.login); // OK <= connexion
    apiRouter.route('/me').get(userCtrl.getMe); // OK <= Trouver l'utilisateur qui est connecté
    apiRouter.route('/user/:id').get(userCtrl.getUserId); // OK <= récupération des données d'un utilisateur inscrit
    apiRouter.route('/allusers').get(userCtrl.getAllUsers); // OK <= récupération des données de tous les utilisateurs
    apiRouter.route('/updateuser').put(userCtrl.putUser); // OK <= put et update = modifier l'utilisateur qui est connecté
    apiRouter.route('/deleteuser').delete(userCtrl.deleteUser); // OK <= supprimer l'utilisateur qui est connecté
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    // route.post

    // apiRouter.route('/getpost').get(postCtrl.getPost);
    apiRouter.route('/allpost').get(postCtrl.getAllPost); // <= afficher tous les post
    apiRouter.route('/post').post(postCtrl.createPost); // <= publier un message (avec texte et/ou image/photo)
    apiRouter.route('/updatepost/:id').put(postCtrl.updatePost); // <= modifier le contenu d'une publication
    apiRouter.route('/deletepost/:id').delete(postCtrl.deletePost); // <= supprimer une publication
    // apiRouter.route('/upload').patch(postCtrl.uploadProfil);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // route.comment

    apiRouter.route('/allcomment').get(commentCtrl.getAllComment); // <= afficher le contenu d'un commentaire
    apiRouter.route('/comment').post(commentCtrl.createComment); // <= publier un commentaire sous une publication
    apiRouter.route('/post/:postId/updatecomment/:commentId').put(commentCtrl.updateComment); // <= modifier le contenu d'un commentaire
    apiRouter.route('/post/:postId/deletecomment/:commentId').delete(commentCtrl.deleteComment); // <= supprimer un commentaire

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // route.like

    apiRouter.route('/post/:id/like').post(likeCtrl.like); // <= aimer une publication ou un commentaire
    apiRouter.route('/post/:id/unlike').post(likeCtrl.unlike); // <= Ne plus aimer
    // apiRouter.route('/likecomment').post(likeCtrl.createLike); // <= aimer une publication ou un commentaire
    // apiRouter.route('/unlikecomment').delete(likeCtrl.unLike); // <= Ne plus aimer

    // apiRouter.route('/like').get(likeCtrl.getLike); // <= afficher qui a aimé une publication ou un commentaire
    // apiRouter.route('/alllikes').get(likeCtrl.getAllLikes); // <= afficher tous les utilisateurs qui ont aimés une publication ou un commentaire

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    //upload
    // apiRouter.patch('/upload', upload.single("file"), commentCtrl.uploadProfil);
    


    return apiRouter;
})();
