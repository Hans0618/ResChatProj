from langchain_ollama.llms import OllamaLLM
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
from langchain.schema import Document
from langchain import hub
from typing_extensions import List, TypedDict
from langgraph.graph import START, StateGraph
import json
from math import radians, cos, sin, sqrt, atan2
from typing import List, Dict

# Initialize the LLM and Embedding Model
ollama = OllamaLLM(model='llama3.2')
embedding_model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

# Load the FAISS index and document embeddings
index = faiss.read_index('data/faiss_index.index')
embeddings_matrix = np.load('data/embeddings.npy')

# Load documents
def load_documents():
    documents = []
    raw_json_docs = ["data/restaurants.json"]  # Add other JSON files if needed
    for file in raw_json_docs:
        with open(file, 'r') as f:
            data = json.load(f)
            for item in data:
                document = Document(page_content=json.dumps(item), metadata={"source": file})
                documents.append(document)
    return documents

documents = load_documents()

# Query the FAISS vector store
def query_vector_store(query, k=5):
    query_embedding = embedding_model.encode([query])[0]
    query_embedding = np.array([query_embedding]).astype(np.float32)
    D, I = index.search(query_embedding, k)
    relevant_docs = [documents[i] for i in I[0]]
    return relevant_docs

# Define the state for the graph
class State(TypedDict):
    question: str
    context: List[Document]
    answer: str

# Load restaurant data
with open('data/restaurants.json', 'r') as f:
    restaurant_data = json.load(f)

# Function to calculate distance between two lat/lon points
def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in kilometers
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2)
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    distance = R * c
    return distance

# Function to find nearby restaurants
def find_nearby_restaurants(lat, lon, radius=5) -> List[Dict]:
    results = []
    for restaurant in restaurant_data:
        rest_lat = restaurant.get("lat")
        rest_lon = restaurant.get("lon")
        if rest_lat is not None and rest_lon is not None:
            distance = calculate_distance(lat, lon, rest_lat, rest_lon)
            if distance <= radius:
                tags = restaurant.get('tags', {})
                results.append({
                    "name": tags.get("name"),
                    "cuisine": tags.get("cuisine"),
                    "lat": rest_lat,
                    "lon": rest_lon,
                    "opening_hours": tags.get("opening_hours"),
                    "website": tags.get("website"),
                    "distance": distance
                })
    return results

# Function to find restaurants by cuisine type
def find_restaurants_by_cuisine(cuisine: str) -> List[Dict]:
    results = []
    for restaurant in restaurant_data:
        tags = restaurant.get('tags', {})
        if 'cuisine' in tags and cuisine.lower() in tags['cuisine'].lower():
            results.append({
                "name": tags.get("name"),
                "cuisine": tags.get("cuisine"),
                "lat": restaurant.get("lat"),
                "lon": restaurant.get("lon"),
                "opening_hours": tags.get("opening_hours"),
                "website": tags.get("website")
            })
    return results

# Retrieve documents or find nearby restaurants or by cuisine
def retrieve(state: State):
    question = state["question"].lower()
    if "near me" in question or "nearby" in question:
        location = state.get("location")
        if location:
            lat = location.get("lat")
            lon = location.get("lon")
            if lat is not None and lon is not None:
                nearby_restaurants = find_nearby_restaurants(lat, lon)
                return {"context": [Document(page_content=str(restaurant)) for restaurant in nearby_restaurants]}
    else:
        # Extract potential cuisine types from the question
        for restaurant in restaurant_data:
            tags = restaurant.get('tags', {})
            cuisine = tags.get('cuisine', '').lower()
            if any(cuisine_type in question for cuisine_type in cuisine.split(';')):
                cuisine_restaurants = find_restaurants_by_cuisine(cuisine)
                return {"context": [Document(page_content=str(restaurant)) for restaurant in cuisine_restaurants]}
    # Default to querying the vector store
    retrieved_docs = query_vector_store(state["question"])
    return {"context": retrieved_docs}

# Generate response
def generate(state: State):
    docs_content = "\n\n".join([doc.page_content for doc in state["context"]])
    input_data = f"Question: {state['question']}\nContext: {docs_content}"
    messages = ollama.invoke(input_data)
    response_stream = ollama.stream(messages)

    def stream_generator():
        buffer = ""
        for chunk in response_stream:
            buffer += chunk
            words = buffer.split()
            if not buffer.endswith(" "):
                buffer = words.pop()
            else:
                buffer = ""
            for word in words:
                yield word + " "
        if buffer:
            yield buffer + " "

    return {"answer": stream_generator()}

# Compile application and make state graph
graph_builder = StateGraph(State).add_sequence([retrieve, generate])
graph_builder.add_edge(START, "retrieve")
graph = graph_builder.compile()
