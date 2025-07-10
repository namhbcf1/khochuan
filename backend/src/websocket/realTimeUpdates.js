// Real-time updates - Live data synchronization across clients 

export class RealtimeHandler {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
  }

  async fetch(request) {
    const url = new URL(request.url);
    
    // Handle WebSocket connection upgrade
    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      // Accept the WebSocket connection
      server.accept();

      // Store the WebSocket connection with a unique ID
      const sessionId = crypto.randomUUID();
      this.sessions.set(sessionId, server);

      // Set up event handlers
      server.addEventListener('message', async (event) => {
        await this.handleMessage(sessionId, event.data);
      });

      server.addEventListener('close', () => {
        this.sessions.delete(sessionId);
      });

      server.addEventListener('error', () => {
        this.sessions.delete(sessionId);
      });

      // Send welcome message
      server.send(JSON.stringify({
        type: 'connected',
        sessionId,
        timestamp: Date.now()
      }));

      return new Response(null, {
        status: 101,
        webSocket: client
      });
    }

    return new Response('Expected WebSocket connection', { status: 400 });
  }

  async handleMessage(sessionId, data) {
    try {
      const message = JSON.parse(data);
      const { type, payload } = message;

      // Handle different message types
      switch (type) {
        case 'ping':
          this.sendToSession(sessionId, {
            type: 'pong',
            timestamp: Date.now()
          });
          break;
          
        case 'broadcast':
          // Broadcast message to all connected clients
          this.broadcastMessage({
            type: 'broadcast',
            sender: sessionId,
            payload,
            timestamp: Date.now()
          });
          break;
          
        default:
          // Echo unknown message types back to sender
          this.sendToSession(sessionId, {
            type: 'error',
            error: 'Unknown message type',
            originalType: type,
            timestamp: Date.now()
          });
      }
    } catch (error) {
      this.sendToSession(sessionId, {
        type: 'error',
        error: 'Invalid message format',
        timestamp: Date.now()
      });
    }
  }

  // Send a message to a specific session
  sendToSession(sessionId, message) {
    const session = this.sessions.get(sessionId);
    if (session && session.readyState === 1) {
      session.send(JSON.stringify(message));
    }
  }

  // Broadcast a message to all connected sessions
  broadcastMessage(message) {
    this.sessions.forEach((session, id) => {
      if (session.readyState === 1) {
        session.send(JSON.stringify(message));
      }
    });
  }
} 