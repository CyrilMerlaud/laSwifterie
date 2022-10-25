//imports
const express = require ('express');
const server = express();
const apiRouter = require('./routes/apiRouter').router;


  //instanciation
server.get('/',(req,res) => {
  res.setHeader('Content-Type','text/html')
  res.send('Bonjour tout le monde') // <= afficher
});

//Middleware
server.use(express.urlencoded({extended: true}));
server.use(express.json());
server.use('/api', apiRouter)

  //écoute du serveur
  server.listen(7000,() => {
    console.log('Server en ecoute sur le port 7000')
  });
  