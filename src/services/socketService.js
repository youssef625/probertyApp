import * as signalR from '@microsoft/signalr';
import { getUserToken } from './api';
import { getApiBaseUrl } from '../utils/apiClient';

const HUB_URL = `${getApiBaseUrl()}/notificationHub`;

class SocketService {
  constructor() {
    this.connection = null;
    this.listeners = new Map();
  }

  connect() {
    
    if (this.connection && this.connection.state !== signalR.HubConnectionState.Disconnected) {
      return;
    }

    const token = getUserToken();
    if (!token) {
      console.warn('SocketService: No auth token found, skipping connection.');
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => getUserToken() 
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    
    
    
    this.listeners.forEach((callbacks, eventName) => {
      callbacks.forEach(callback => {
        this.connection.on(eventName, callback);
      });
    });

    this.connection.start()
      .then(() => {
        console.log('SignalR Connected!');
      })
      .catch(err => {
        console.error('SignalR Connection Error: ', err);
        
        this.connection = null;
      });

    
    this.connection.onreconnected(() => {
      console.log('SignalR Reconnected!');
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

    
    if (this.connection) {
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
