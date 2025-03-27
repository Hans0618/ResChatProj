import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from langchain.schema import Document

# Load JSON data
raw_json_docs = ["restaurants.json"]

documents = []
num = 0
model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

# Process JSON files
for file in raw_json_docs:
    with open(file, 'r') as f:
        data = json.load(f)
        for item in data:
            # Assuming each item is a restaurant entry
            document = Document(page_content=str(item), metadata={"source": file, "seq_num": num + 1})
            num += 1
            documents.append(document)

# Create embeddings for the documents
document_texts = [doc.page_content for doc in documents]
embeddings_vectors = model.encode(document_texts)

# Prepare FAISS index
dimension = len(embeddings_vectors[0])  # Get the embedding dimension
index = faiss.IndexFlatL2(dimension)  # L2 distance index for FAISS

# Convert embeddings to numpy array and add to the FAISS index
embeddings_matrix = np.array(embeddings_vectors).astype(np.float32)
index.add(embeddings_matrix)

# Save files for use by chatbot
faiss.write_index(index, 'data/faiss_index.index')
np.save('data/embeddings.npy', embeddings_matrix)
