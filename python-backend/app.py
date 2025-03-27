from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from chatbot import graph

app = Flask(__name__)
CORS(app)

# Define the /api/query endpoint
@app.route('/api/query', methods=['POST'])
def query_api():
    data = request.json
    question = data.get("query", "")
    response = graph.invoke({"question": question})

    # Collect the full response from the generator
    full_response = "".join(response["answer"]) if hasattr(response["answer"], '__iter__') else response["answer"]
    
    return jsonify({"response": full_response})

# Streaming response for asynchronous delivery
@app.route('/chat/stream', methods=['GET'])
def stream():
    user_question = request.args.get("message", "")

    def generate_response():
        try:
            response_stream = graph.invoke({"question": user_question})
            generated_response = response_stream["answer"]

            # Ensure the response is iterable
            if hasattr(generated_response, '__iter__'):
                for chunk in generated_response:
                    words = chunk.split()  # Split the chunk into words
                    for word in words:
                        yield f"data: {word}\n\n"
        except Exception as e:
            print(f"Error in stream: {e}")

    return Response(generate_response(), content_type="text/event-stream")

# Non-streaming response
@app.route('/chat', methods=['POST'])
def handle_message():
    data = request.json
    user_question = data.get("message", "")

    # Invoke state graph created in 'chatBot.py'
    response = graph.invoke({"question": user_question})

    # Collect the full response from the generator
    full_response = "".join(response["answer"]) if hasattr(response["answer"], '__iter__') else response["answer"]
    
    return jsonify({"answer": full_response})

# Example endpoint for fetching all restaurants
@app.route('/api/restaurants', methods=['GET'])
def get_restaurants():
    # Implement logic to fetch restaurants from your data source
    return jsonify([])  # Replace with actual data

# Example endpoint for fetching nearby restaurants
@app.route('/api/restaurants/nearby', methods=['GET'])
def get_nearby_restaurants():
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    # Implement logic to find nearby restaurants
    return jsonify([])  # Replace with actual data

if __name__ == '__main__':
    app.run(debug=True, threaded=True)
