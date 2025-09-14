import { pipeline } from '@xenova/transformers';
import PredefinedResponse from '../models/PredefinedResponse';

let classifier: any;
let generator: any;

async function loadModels() {
  if (!classifier) {
    classifier = await pipeline('text-classification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
  }
  if (!generator) {
    generator = await pipeline('text-generation', 'Xenova/gpt2');
  }
}

export async function detectIntent(message: string): Promise<string> {
  await loadModels();
  // Regex simple
  if (message.toLowerCase().includes('precio')) return 'precios';
  if (message.toLowerCase().includes('comprar')) return 'comprar';
  if (message.toLowerCase().includes('soporte')) return 'soporte';
  // Fallback a classifier
  const result = await classifier(message);
  // Mapear resultado a intent, simplificado
  if (result[0].label === 'POSITIVE') return 'comprar';
  return 'soporte';
}

export async function generateResponse(intent: string, message: string): Promise<string> {
  await loadModels();
  // Buscar predefined
  const predefined = await PredefinedResponse.findOne({ intent });
  if (predefined) return predefined.response;
  // Generar con IA
  const prompt = `Responde como chatbot: ${message}`;
  const result = await generator(prompt, { max_length: 50 });
  return result[0].generated_text.replace(prompt, '').trim();
}