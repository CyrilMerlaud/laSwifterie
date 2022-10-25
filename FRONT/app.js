// Imports

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const fetch= require('node-fetch');

const LocalStorage = require("node-localstorage").LocalStorage;
let localStorage = new LocalStorage("./storageToken");
const multer  = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'public/img/uploads/');
    },
    filename: function(req, file, callback)  {
        callback(null, file.originalname + '-' + Date.now());
    }
 })

var upload = multer({ storage: storage });

const app = express();
const port = 5000;

// Fichiers statiques

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/img', express.static(__dirname + 'public/img'));
app.set('views', path.join(__dirname, 'views'));

// Moteur view 8

app.use(expressLayouts);
app.set('layout', './layouts/full-width');
app.set('view engine', 'ejs');

// Navigation 

app.get('/connexion', (req, res) => {                        // ------------ Route Connexion -------------- // 
    res.render('connexion', { title: 'Connexion', layout: './layouts/sidebar_connexion'})           // ------------ Affiche la Page connexion.ejs------- // 
});

app.get('/inscription', (req, res) => {                      // ------------ Route Inscription -------------- // 
    res.render('inscription', { title: 'Inscription', layout: './layouts/sidebar_inscription'})       // ------------ Affiche la Page inscription.ejs ------ //
});

app.get('/profil', upload.single('attachment'), async (req, res) => {            // ------------ Route Profil + afficher le pseudo ------------ // OK ✔

    const myProfil = await fetch('http://localhost:7000/api/me', {
        method: 'GET',
        headers: {
        Authorization:localStorage.getItem("token"),
        'Content-Type': 'application/json',
        },
    })
    me = await myProfil.json()
    res.render('profil', { title: 'Profil', layout: './layouts/sidebar_profil', profil: me})  // ------------ Affiche la Page profil.ejs------- // 
});

app.get('/about', (req, res) => {                            // ------------ Route À Propos -------------- // 
    res.render('about', { title: 'À Propos', layout: './layouts/sidebar'})
});

//  CRUD User => CREER UN COMPTE - SE CONNECTER // DECONNECTER - MODIFIER - SUPPRIMER 


app.post('/inscription', async (req, res) => {       // ------------ CREER UN COMPTE ------------ // OK ✔
    
    let rawResponse = await fetch('http://localhost:7000/api/register', {
             method: 'POST',
             headers: {
             'Accept': 'application/json',
             'Content-Type': 'application/json'
             },
             body: JSON.stringify({
                 username: req.body.username, 
                 email: req.body.email, 
                 password: req.body.password})
         })
         
         const content = await rawResponse.json();
         if (content.message) {
             res.redirect('/connexion')                // redirige l'utilisateur vers la page connexion.ejs
         } 
         else res.render('inscription', content)   
  });

app.post('/connexion', async (req, res) => {            // ------------ SE CONNECTER ----------------- // OK ✔

    let rawResponse = await fetch('http://localhost:7000/api/login', {
        method: 'POST',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: req.body.email, 
            password: req.body.password})
    });
    const content = await rawResponse.json();
    const token = content.token;
    
    if(token) {
        localStorage.setItem("token", token); // Stocker le token dans le local 
        res.redirect("/profil")              // redirige l'utilisateur vers la page Profil
    }else{
        res.render("connexion",content)
    } 
});

app.post('/profil', upload.single('attachment'), async (req, res) => {                // ------------ MODIFIER (username, attachment, bio)------------ // OK ✔

    let updateProfil = await fetch('http://localhost:7000/api/updateuser', {
        method: 'PUT', 
        headers: {
        Authorization:localStorage.getItem("token"),
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
           username: req.body.username,
           attachment: req.body.attachment,
           bio: req.body.bio 
        })
    });
    const putProfil = await updateProfil.json();
   
    if(putProfil) {
        res.redirect('/profil')
    }
});
        
app.post('/delete', async (req, res) => {           // ------------ SUPPRIMER LE COMPTE ------------ // OK ✔

    const myDelete = await fetch('http://localhost:7000/api/deleteuser', {
        method: 'DELETE',
        headers: {
        Authorization:localStorage.getItem("token"),
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        },
    })
    const myJson = await myDelete.json()
    if(myJson.success)
    res.redirect('/inscription')
});

app.post('/logout', async (req, res) => {                // ------------ SE DÉCONNECTER ------------ // OK ✔

    localStorage.clear();

    res.redirect('/connexion')
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//  CRUD Post => Poster MESSAGE / IMAGE - LIRE POSTS - MODIFIER post - SUPPRIMER post

app.post('/fil_actu', upload.single('attachment'), async (req, res) => {   // ------------ POSTER UN MESSAGE / UNE IMAGE ------------ // OK ✔
    
    await fetch('http://localhost:7000/api/post', {
        method: 'POST',
        headers: {
        Authorization:localStorage.getItem("token"),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: req.body.content,
            attachment: req.body.attachment,
        })
    })   
    .then(response => response.json())  // converti en JSON
    .then(json => console.log(json))    // Affiche les résultats dans la console
    res.redirect('/fil_actu')   
});

app.get('/fil_actu', async (req, res) => {                       // ------------ LIRE les posts et les commentaires------------ // OK ✔
    // console.log("TEST READ ALL POSTS" , req.body)
    try{    let response = await fetch('http://localhost:7000/api/allpost');
                const myJson = await response.json();
            let comments = await fetch('http://localhost:7000/api/allcomment');
                const jsonComments = await comments.json();
    // console.log( "------------------ tous les posts -----------------", myJson);
            res.render('fil_actu', {infoPost : myJson, infoComments: jsonComments}) }
    catch(err){
        console.log(err);
    }
});

app.post('/fil_actu/:id', upload.single('attachment'), async (req, res) => {     // ------------ MOFIFIER un post ------------ // OK ✔
    const postId = req.params.id

    await fetch(`http://localhost:7000/api/updatepost/`+ postId, {
        method: 'PUT', 
        headers: {
        Authorization:localStorage.getItem("token"),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: req.body.content,
            attachment: req.body.attachment 
        })
    })
    .then(response => response.json())  // converti en JSON
    .then(json => console.log(json))    // Affiche les résultats dans la console
    .catch((err) => console.log(err))
    res.redirect('/fil_actu')  
});

app.post('/deletepost/:id', async (req, res) => {           // ------------ SUPPRIMER un post ------------ // OK ✔
    const postId = req.params.id

    const myDeletepost = await fetch('http://localhost:7000/api/deletepost/'+ postId, {
        method: 'DELETE',
        headers: {
        Authorization:localStorage.getItem("token"),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
    })
    const myJson = await myDeletepost.json()
    if(myJson.success) return res.redirect('/fil_actu')
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//  CRUD Comment => Commenter avec MESSAGE / IMAGE - LIRE com - MODIFIER com - SUPPRIMER com

app.post('/comment/:id', async (req, res) => {   // ------------ POSTER UN COMMENTAIRE  ------------ // OK ✔
    
    console.log(req.params.id);
    await fetch('http://localhost:7000/api/comment', {
        method: 'POST',
        headers: {
        Authorization:localStorage.getItem("token"),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            postId: req.params.id,
            content: req.body.content,
        })
    })   
    .then(response => response.json())  // converti en JSON
    .then(json => console.log(json))
    .catch((err) => console.log(err))    // Affiche les résultats dans la console
    res.redirect('/fil_actu')   
});

app.post('/post/:postId/updatecomment/:commentId', async (req, res) => {  // ------------ MODIFIER un commentaire ------------ // OK ✔
    
    const commentId = req.params.commentId
    const postId = req.params.postId

    const myUpdatecomment = await fetch('http://localhost:7000/api/post/'+postId+'/updatecomment/'+commentId, {
        method: 'PUT',
        headers: {
        Authorization:localStorage.getItem("token"),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: req.body.content
        })
    })
    const myJson = await myUpdatecomment.json()
    console.log(myJson);
    if(myJson.success) return res.redirect('/fil_actu')
    // .then(response => response.json())  
    // .then(json => console.log(json))   
    // .catch((err) => console.log(err))
    // res.redirect('/fil_actu')
});

app.post('/post/:postId/deletecomment/:commentId', async (req, res) => {  // ------------ SUPPRIMER un commentaire ------------ // OK ✔
    
    const commentId = req.params.commentId
    const postId = req.params.postId

    await fetch('http://localhost:7000/api/post/'+postId+'/deletecomment/'+commentId, {
        method: 'DELETE',
        headers: {
        Authorization:localStorage.getItem("token"),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
    })
    .then(response => response.json())  // converti en JSON
    .then(json => console.log(json))    // Affiche les résultats dans la console
    .catch((err) => console.log(err))
    res.redirect('/fil_actu') 
});

// app.get('/comment', async (req, res) => {                       // ------------ LIRE tous les commentaire ------------ // OK ✔
    
//     let response = await fetch('http://localhost:7000/api/allcomment');
//         const myJson = await response.json();
//     return res.render('comment', {infoComment : myJson}) 
// });


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//  CRUD Likes => un LIKE - Unlike - LIRE like - 

app.post("/postlike/:id", async (req, res) => {
    console.log( '-----hello---', req.params.id) 

    const id = req.params.postId

  await fetch(`http://localhost:7000/api/post/${req.params.id}/like`, {
  method: "POST",  
  headers: {
      Authorization: localStorage.getItem('token'),
      "Accept": 'application/json',
      "Content-type": "application/json"
    }
  })
  .then(response => response.json())
  .then(json => {
    console.log( '-----JSON ICI-----', json)
    res.redirect('/fil_actu')
   })
}),


app.post("/postunlike/:id", async (req, res) => {
    console.log( '-----hello---', req.params.id) 

    const id = req.params.postId

  await fetch(`http://localhost:7000/api/post/${req.params.id}/unlike`, {
  method: "POST",  
  headers: {
      Authorization: localStorage.getItem('token'),
      "Accept": 'application/json',
      "Content-type": "application/json"
    }
  })
  .then(response => response.json())
  .then(json => {
    console.log( '-----JSON ICI-----', json)
    res.redirect('/fil_actu')
   })
}),
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ECOUTE DU SERVEUR



app.listen(port, () => console.info(`en écoute sur le port ${port}`));