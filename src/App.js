import React, { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { LexRuntimeV2Client, RecognizeTextCommand } from "@aws-sdk/client-lex-runtime-v2";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import awsExports from './aws-exports';
import '@aws-amplify/ui-react/styles.css';


Amplify.configure(awsExports);

// Create the Lex client using credentials from Identity Pool
const client = new LexRuntimeV2Client({
  region: 'us-east-1',
  credentials: fromCognitoIdentityPool({
    clientConfig: { region: 'us-east-1' },
    identityPoolId: "us-east-1:857d513f-bdcf-4401-abfa-5e7809e2ebd8", //  Insert the new Identity Pool ID here!
  }),
});


function App({ signOut, user }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    try {
      const params = {
        botId: '96EOARWDQI',        //  Lex V2 Bot ID
        botAliasId: 'TSTALIASID',   //  Lex Bot Alias ID
        localeId: 'en_US',
        sessionId: user.username,   // Unique session per user
        text: input,
      };

      const command = new RecognizeTextCommand(params);
      const response = await client.send(command);

      const botMessage = response.messages?.[0]?.content || "No response";

      setMessages(prev => [
        ...prev,
        { from: 'user', text: input },
        { from: 'bot', text: botMessage }
      ]);

      setInput('');
    } catch (error) {
      console.error("Error communicating with bot:", error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🚀 Tech Support Chatbot</h2>
      <p>Welcome, {user.username}!</p>
      <button onClick={signOut}>Sign out</button>

      <div style={{ marginTop: '30px', border: '1px solid gray', padding: '10px', height: '400px', overflowY: 'scroll' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.from === 'user' ? 'right' : 'left' }}>
            <strong>{msg.from === 'user' ? 'You' : 'Bot'}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '10px' }}>
        <input
          style={{ width: '70%', padding: '10px' }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message here..."
        />
        <button onClick={sendMessage} style={{ padding: '10px' }}>Send</button>
      </div>
    </div>
  );
}

export default withAuthenticator(App);
