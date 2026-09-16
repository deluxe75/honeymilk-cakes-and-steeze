/**
 * Real-Time SSE (Server-Sent Events) Service
 * Connects admin dashboard to /api/orders/stream
 */

type StreamEventHandler = (event: string, data: any) => void;

class OrderStreamManager {
  private eventSource: EventSource | null = null;
  private listeners: Set<StreamEventHandler> = new Set();
  private reconnectTimer: any = null;
  private isConnected = false;
  private statusListeners: Set<(connected: boolean) => void> = new Set();

  public subscribe(handler: StreamEventHandler): () => void {
    this.listeners.add(handler);
    if (!this.eventSource) {
      this.connect();
    }
    return () => {
      this.listeners.delete(handler);
      if (this.listeners.size === 0) {
        this.disconnect();
      }
    };
  }

  public onStatusChange(callback: (connected: boolean) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.isConnected);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  private setConnectionStatus(status: boolean) {
    this.isConnected = status;
    this.statusListeners.forEach((cb) => cb(status));
  }

  private connect() {
    if (typeof window === 'undefined') return;

    try {
      this.eventSource = new EventSource('/api/orders/stream');

      this.eventSource.onopen = () => {
        this.setConnectionStatus(true);
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.eventSource.addEventListener('new_order', (e) => {
        try {
          const data = JSON.parse(e.data);
          this.notify('new_order', data);
        } catch (err) {
          console.error('SSE JSON error:', err);
        }
      });

      this.eventSource.addEventListener('order_status_updated', (e) => {
        try {
          const data = JSON.parse(e.data);
          this.notify('order_status_updated', data);
        } catch (err) {
          console.error('SSE JSON error:', err);
        }
      });

      this.eventSource.addEventListener('new_custom_order', (e) => {
        try {
          const data = JSON.parse(e.data);
          this.notify('new_custom_order', data);
        } catch (err) {
          console.error('SSE JSON error:', err);
        }
      });

      this.eventSource.addEventListener('payment_verified', (e) => {
        try {
          const data = JSON.parse(e.data);
          this.notify('payment_verified', data);
        } catch (err) {
          console.error('SSE JSON error:', err);
        }
      });

      this.eventSource.onerror = () => {
        this.setConnectionStatus(false);
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        // Auto-reconnect after 4 seconds
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            if (this.listeners.size > 0) {
              this.connect();
            }
          }, 4000);
        }
      };
    } catch (err) {
      console.warn('Failed to establish EventSource:', err);
      this.setConnectionStatus(false);
    }
  }

  private notify(event: string, data: any) {
    this.listeners.forEach((handler) => {
      try {
        handler(event, data);
      } catch (err) {
        console.error('Error in SSE listener handler:', err);
      }
    });
  }

  public disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.setConnectionStatus(false);
  }
}

export const orderStream = new OrderStreamManager();
