# AIVeda RAG Chatbot Microservice (Python/FastAPI) - UPGRADED
# This version integrates two knowledge sources: a detailed CSV of food items
# and a JSON file containing core Ayurvedic concepts. This creates a more robust
# and contextually aware RAG system.

import os
# Fix OpenMP library conflict on macOS
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

import numpy as np
import pandas as pd
import faiss
import google.generativeai as genai
from dotenv import load_dotenv
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# --- GLOBAL VARIABLES & CONSTANTS ---
FOOD_DATA_FILE = 'Food_items.csv'
CONCEPT_DATA_FILE = 'ayurvedic_concepts.json'  # Our new encyclopedia
INDEX_FILE = 'datasets/ayurveda_unified_index.faiss'    # New unified index file
TEXT_DATA_FILE = 'datasets/ayurveda_unified_text.json'  # New unified text data file
EMBEDDING_MODEL = 'text-embedding-004'

class AIVedaRAGChatbot:
    def __init__(self):
        self.faiss_index = None
        self.text_chunks = []
        self.is_initialized = False
        self._initialize_gemini()
    
    def _initialize_gemini(self):
        """Initialize Google Generative AI with API key"""
        try:
            load_dotenv()
            api_key = os.getenv('GEMINI_API_KEY')
            if not api_key:
                raise ValueError("GEMINI_API_KEY not found. Please set it in your .env file.")
            genai.configure(api_key=api_key)
            logger.info("Google AI configured successfully")
        except Exception as e:
            logger.error(f"Error configuring Google AI: {e}")
            raise

    def create_food_text_chunk(self, row):
        """Creates a rich, descriptive paragraph from a food item row."""
        return (
            f"Food Item Information: {row.get('name_en', 'N/A')}.\n"
            f"Category: {row.get('category', 'N/A')}.\n"
            f"Ayurvedic Properties:\n"
            f"  - Vata Dosha: {row.get('ayurveda_dosha_vata', 'N/A')}\n"
            f"  - Pitta Dosha: {row.get('ayurveda_dosha_pitta', 'N/A')}\n"
            f"  - Kapha Dosha: {row.get('ayurveda_dosha_kapha', 'N/A')}\n"
            f"  - Taste (Rasa): {row.get('ayurveda_rasa', 'N/A')}\n"
            f"  - Qualities (Guna): {row.get('ayurveda_guna', 'N/A')}\n"
            f"  - Energy (Virya): {row.get('ayurveda_virya', 'N/A')}\n"
            f"  - Post-Digestive Effect (Vipaka): {row.get('ayurveda_vipaka', 'N/A')}.\n"
            f"Health Benefits: {row.get('health_tags', 'N/A')}.\n"
            f"Safety Information:\n"
            f"  - Cautions: {row.get('contraindications', 'N/A')}\n"
            f"  - Drug Interactions: {row.get('drug_interactions', 'N/A')}\n"
        )

    def load_and_process_data(self):
        """
        Loads data from BOTH the food CSV and the concepts JSON, generates embeddings,
        and builds a single, unified FAISS index.
        """
        logger.info("Initializing Unified RAG system...")
        
        if os.path.exists(INDEX_FILE) and os.path.exists(TEXT_DATA_FILE):
            logger.info(f"Loading existing unified FAISS index from {INDEX_FILE}...")
            self.faiss_index = faiss.read_index(INDEX_FILE)
            with open(TEXT_DATA_FILE, 'r', encoding='utf-8') as f:
                self.text_chunks = json.load(f)
            logger.info("Unified RAG system loaded successfully.")
            self.is_initialized = True
            return

        logger.info("No existing index found. Building new unified index...")
        all_chunks = []
        
        # 1. Process Food Data from CSV
        try:
            logger.info(f"  - Loading food items from {FOOD_DATA_FILE}...")
            df = pd.read_csv(FOOD_DATA_FILE).fillna('')
            food_chunks = [self.create_food_text_chunk(row) for _, row in df.iterrows()]
            all_chunks.extend(food_chunks)
            logger.info(f"  - Loaded {len(food_chunks)} food item entries.")
        except FileNotFoundError:
            logger.error(f"ERROR: The data file '{FOOD_DATA_FILE}' was not found.")
            # Create a minimal food dataset if file doesn't exist
            logger.info("Creating minimal food dataset...")
            all_chunks.extend(self._create_minimal_food_data())

        # 2. Process Conceptual Data from JSON
        try:
            logger.info(f"  - Loading concepts from {CONCEPT_DATA_FILE}...")
            with open(CONCEPT_DATA_FILE, 'r', encoding='utf-8') as f:
                concepts = json.load(f)
            concept_chunks = [f"Ayurvedic Concept Definition: {item['concept']}.\nDescription: {item['description']}" for item in concepts]
            all_chunks.extend(concept_chunks)
            logger.info(f"  - Loaded {len(concept_chunks)} conceptual entries.")
        except FileNotFoundError:
            logger.error(f"ERROR: The concepts file '{CONCEPT_DATA_FILE}' was not found.")
            # Create minimal concept data if file doesn't exist
            logger.info("Creating minimal concept dataset...")
            all_chunks.extend(self._create_minimal_concept_data())

        self.text_chunks = all_chunks
        logger.info(f"Total knowledge chunks to be embedded: {len(self.text_chunks)}")

        try:
            logger.info("Generating embeddings... This is a one-time process and may take several minutes.")
            batch_size = 100
            all_embeddings = []
            for i in range(0, len(self.text_chunks), batch_size):
                batch = self.text_chunks[i:i+batch_size]
                result = genai.embed_content(
                    model=EMBEDDING_MODEL,
                    content=batch,
                    task_type="RETRIEVAL_DOCUMENT"
                )
                all_embeddings.extend(result['embedding'])
                logger.info(f"    - Embedded batch {i//batch_size + 1}/{(len(self.text_chunks)-1)//batch_size + 1}")

            embeddings = np.array(all_embeddings).astype('float32')
            logger.info("Embeddings generated.")
            
            embedding_dim = embeddings.shape[1]
            self.faiss_index = faiss.IndexFlatL2(embedding_dim)
            self.faiss_index.add(embeddings)
            
            faiss.write_index(self.faiss_index, INDEX_FILE)
            with open(TEXT_DATA_FILE, 'w', encoding='utf-8') as f:
                json.dump(self.text_chunks, f)
                
            logger.info(f"Unified FAISS index built and saved to {INDEX_FILE}.")
            self.is_initialized = True
            
        except Exception as e:
            logger.error(f"An error occurred during embedding or indexing: {e}")
            raise

    def _create_minimal_food_data(self):
        """Creates minimal food data if CSV doesn't exist"""
        minimal_foods = [
            "Food Item Information: Rice.\nCategory: Grains.\nAyurvedic Properties:\n  - Vata Dosha: Neutral\n  - Pitta Dosha: Cooling\n  - Kapha Dosha: Increases\n  - Taste (Rasa): Sweet\n  - Qualities (Guna): Heavy, Soft\n  - Energy (Virya): Cooling\n  - Post-Digestive Effect (Vipaka): Sweet.\nHealth Benefits: Energy, Easy digestion.\nSafety Information:\n  - Cautions: None\n  - Drug Interactions: None",
            "Food Item Information: Turmeric.\nCategory: Spices.\nAyurvedic Properties:\n  - Vata Dosha: Balances\n  - Pitta Dosha: Balances\n  - Kapha Dosha: Reduces\n  - Taste (Rasa): Bitter, Pungent\n  - Qualities (Guna): Light, Dry\n  - Energy (Virya): Heating\n  - Post-Digestive Effect (Vipaka): Pungent.\nHealth Benefits: Anti-inflammatory, Antioxidant.\nSafety Information:\n  - Cautions: High doses may cause stomach upset\n  - Drug Interactions: Blood thinners",
        ]
        return minimal_foods

    def _create_minimal_concept_data(self):
        """Creates minimal concept data if JSON doesn't exist"""
        minimal_concepts = [
            "Ayurvedic Concept Definition: Vata Dosha.\nDescription: One of the three doshas, governing movement, circulation, and nervous system. When balanced, promotes creativity and vitality.",
            "Ayurvedic Concept Definition: Pitta Dosha.\nDescription: One of the three doshas, governing metabolism, digestion, and transformation. When balanced, promotes intelligence and courage.",
            "Ayurvedic Concept Definition: Kapha Dosha.\nDescription: One of the three doshas, governing structure, immunity, and lubrication. When balanced, promotes stability and strength.",
        ]
        return minimal_concepts

    async def chat(self, user_query: str) -> str:
        """Main chat function that processes user queries and returns responses"""
        if not self.is_initialized:
            raise Exception("RAG system not initialized. Please call load_and_process_data() first.")
        
        if not user_query:
            raise ValueError("Message is required")

        logger.info(f'New Query: "{user_query}"')

        try:
            logger.info("1. Embedding query...")
            query_embedding_result = genai.embed_content(
                model=EMBEDDING_MODEL, 
                content=user_query, 
                task_type="RETRIEVAL_QUERY"
            )
            query_embedding = np.array([query_embedding_result['embedding']]).astype('float32')

            logger.info("2. Searching unified index...")
            # Retrieve more documents to give broader context for conceptual questions
            k = 5 
            distances, indices = self.faiss_index.search(query_embedding, k)
            context_docs = [self.text_chunks[i] for i in indices[0]]
            context = "\n\n---\n\n".join(context_docs)
            logger.info(f"3. Retrieved Context snippet: {context[:200]}...")

            system_prompt = (
                "You are a friendly Ayurvedic guide. Answer the user's question in a simple, conversational way using ONLY the provided info. If the info isn't there, just say you don't have the answer. Limit to 250 characters."
            )
            
            full_prompt = (
                f"**System Instruction:**\n{system_prompt}\n\n"
                f"**Retrieved Knowledge:**\n{context}\n\n"
                f"**User's Question:**\n{user_query}\n\n"
                f"**Your Comprehensive Answer:**"
            )

            logger.info("4. Generating response from Gemini...")
            generation_model = genai.GenerativeModel('gemini-1.5-flash')
            response = generation_model.generate_content(full_prompt)
            
            bot_response = response.text
            logger.info(f"5. Gemini Response: {bot_response[:100]}...")

            return bot_response

        except Exception as e:
            logger.error(f'An error in chat function: {e}')
            raise

# Global instance
rag_chatbot = AIVedaRAGChatbot()