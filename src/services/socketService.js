import * as signalR from '@microsoft/signalr';
import { getUserToken } from './api';

const API_BASE_URL = window.location.origin.replace(/\/+$/, ''); 
const HUB_URL = `${API_BASE_URL}/notificationHub`;

class SocketService {
  constructor() {
    this.connection = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.connection) return;

    const token = getUserToken();
    if (!token) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    this.connection.start()
      .then(() => {
        console.log('SignalR Connected!');
        // Re-attach listeners after connection
        this.listeners.forEach((callbacks, eventName) => {
          callbacks.forEach(callback => {
            this.connection.on(eventName, callback);
          });
        });
      })
      .catch(err => {
        console.error('SignalR Connection Error: ', err);
      });
  }

  disconnect() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
    }
  }

  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);

    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      this.connection.on(eventName, callback);
    }
  }

  off(eventName, callback) {
    if (this.listeners.has(eventName)) {
      const callbacks = this.listeners.get(eventName).filter(cb => cb !== callback);
      this.listeners.set(eventName, callbacks);
    }

    if (this.connection) {
      this.connection.off(eventName, callback);
    }
  }
}

export const socketService = new SocketService();
