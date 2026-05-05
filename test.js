import dotenv from 'dotenv';
dotenv.config();

console.log('✅ Environnement prêt !');
console.log('Mistral API Key:', process.env.MISTRAL_API_KEY ? '✅ présente' : '❌ manquante');
console.log('Groq API Key:', process.env.GROQ_API_KEY ? '✅ présente' : '❌ manquante');
console.log('Hugging Face API Key:', process.env.HF_API_KEY ? '✅ présente' : '❌ manquante');
console.log('Pinecone API Key:', process.env.PINECONE_API_KEY ? '✅ présente' : '❌ manquante');