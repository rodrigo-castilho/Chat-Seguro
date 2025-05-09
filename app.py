from flask import Flask, render_template, request, jsonify, session
from flask_wtf.csrf import CSRFProtect
from cryptography.fernet import Fernet
import base64
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = os.urandom(24)


csrf = CSRFProtect(app)


key = Fernet.generate_key()
cipher_suite = Fernet(key)


messages_db = []

@app.before_request
def before_request():
    if 'username' not in session:
        session['username'] = f"User_{os.urandom(4).hex()}"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/send_message', methods=['POST'])
def send_message():
    try:
        data = request.get_json()
        
        
        if not data.get('_csrf_token'):
            return jsonify({'status': 'error', 'message': 'CSRF token missing'}), 403
            
        
        encrypted_message = cipher_suite.encrypt(data['message'].encode())
        
        
        message = {
            'sender': session['username'],
            'message': encrypted_message.decode(),
            'timestamp': data['timestamp'],
            'is_encrypted': True
        }
        messages_db.append(message)
        
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/get_messages')
def get_messages():
    try:
        
        decrypted_messages = []
        for msg in messages_db:
            if msg['is_encrypted']:
                decrypted_msg = cipher_suite.decrypt(msg['message'].encode()).decode()
            else:
                decrypted_msg = msg['message']
                
            decrypted_messages.append({
                'sender': msg['sender'],
                'message': decrypted_msg,
                'timestamp': msg['timestamp']
            })
        
        return jsonify({'messages': decrypted_messages})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)