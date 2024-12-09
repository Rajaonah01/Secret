const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const axios = require('axios');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'speaksecret'
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
    return;
  }
  console.log('Connecté à la base de données MySQL');
});

app.get('/', (req, res) => {
  res.render('index', {
    title: 'SecretSpeak',
    description: 'SecretSpeak est votre plateforme de confiance pour des discussions confidentielles.'
  });
});

app.get('/about', (req, res) => {
  res.render('about', {
    title: 'À propos de SecretSpeak'
  });
});

app.get('/login', (req, res) => {
  res.render('login', {
    title: 'Connexion'
  });
});

app.get('/index', (req, res) => {
  res.render('index', {
    title: 'welcome'
  });
});

app.post('/login', (req, res) => {
  const { email, mot_de_passe } = req.body;
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Erreur lors de la requête de connexion:', err);
      res.status(500).json({ message: 'Erreur serveur' });
      return;
    }
    if (results.length > 0) {
      const user = results[0];
      const match = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
      if (match) {
        res.json({ message: 'Connexion réussie', redirect: '/welcome' });
      } else {
        res.status(401).json({ message: 'Mot de passe incorrect' });
      }
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  });
});

app.get('/signup', (req, res) => {
  res.render('signup', {
    title: 'Inscription'
  });
});

app.post('/signup', async (req, res) => {
  const { nom, email, mot_de_passe } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    const query = 'INSERT INTO users (nom, email, mot_de_passe) VALUES (?, ?, ?)';
    db.query(query, [nom, email, hashedPassword], (err, result) => {
      if (err) {
        console.error('Erreur lors de la requête d\'inscription:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      res.json({ message: 'Inscription réussie' });
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contactez-nous'
  });
});

app.post('/submit-contact-form', (req, res) => {
  const { name, email, message } = req.body;
  console.log(`Nom: ${name}, Email: ${email}, Message: ${message}`);
  res.json({ message: 'Votre message a été envoyé avec succès !' });
});

app.get('/welcome', (req, res) => {
  res.render('welcome', {
    title: 'Bienvenue sur SecretSpeak'
  });
});


  // //twilio
  // const twilio = require('twilio');
  
  // // Vos informations d'authentification Twilio
  // const accountSid = 'AC42be0c2036189df64102b4ee512aad07';
  // const authToken = '07ad35e98cdc93d1096daa6ecb6dc64b';
  // const client = twilio(accountSid, authToken);
  
  // app.post('/send-sms', (req, res) => {
  //     const { to, message } = req.body;
  
  //     client.messages
  //         .create({
  //             body: message,
  //             from: '+17752597890', // Numéro Twilio
  //             to: '+2610381906963', // Numéro du destinataire 
  //         })
  //         .then((message) => res.status(200).send(`Message envoyé : ${message.sid}`))
  //         .catch((error) => {
  //             console.error('Erreur :', error);
  //             res.status(500).send('Erreur lors de l\'envoi du SMS.');
  //         });
  // });
app.listen(port, async () => {
  console.log(`Serveur en cours d'exécution à http://localhost:${port}`);
});


