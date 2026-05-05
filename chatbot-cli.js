import dotenv from 'dotenv';
import readline from 'node:readline';

dotenv.config();

// Configuration Mistral
const MISTRAL_CONFIG = {
  url: 'https://api.mistral.ai/v1/chat/completions',
  key: process.env.MISTRAL_API_KEY,
  model: 'mistral-small-latest'
};

// Promisifier rl.question
function question(rl, prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Fonction pour appeler Mistral
async function askMistral(userMessage) {
  try {
    const response = await fetch(MISTRAL_CONFIG.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_CONFIG.key}`
      },
      body: JSON.stringify({
        model: MISTRAL_CONFIG.model,
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
    
  } catch (error) {
    console.error('Erreur API:', error.message);
    return "Désolé, une erreur s'est produite. Veuillez réessayer.";
  }
}

// Boucle principale
async function main() {
  // Créer l'interface readline
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('Chatbot CLI — Phase 1. (Ctrl+C pour quitter)\n');

  while (true) {
    const userMessage = await question(rl, 'Vous : ');
    
    // Quitter si l'utilisateur tape 'exit' ou 'quit'
    if (userMessage.toLowerCase() === 'exit' || userMessage.toLowerCase() === 'quit') {
      console.log('Au revoir !');
      rl.close();
      break;
    }

    // Ignorer les messages vides
    if (userMessage.trim() === '') {
      console.log('Veuillez entrer un message.\n');
      continue;
    }

    // Appeler Mistral et afficher la réponse
    const response = await askMistral(userMessage);
    console.log(`IA : ${response}\n`);
  }
}

// Gestion de Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\nAu revoir !');
  process.exit(0);
});

// Lancer le chatbot
main();