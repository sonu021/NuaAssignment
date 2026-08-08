export type EventName =
  | "product_viewed"
  | "add_to_cart"
  | "search_performed"
  | "app_backgrounded";

export interface AnalyticsEvent {
  id: string;
  name: EventName;
  timestamp: string;
  metadata: Record<string, any>;
}

type EventListener = (event: AnalyticsEvent) => void;

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private listeners: Set<EventListener> = new Set();
  private maxStoredEvents = 100;

  /**
   * Log an event with structured metadata
   */
  logEvent(name: EventName, metadata: Record<string, any> = {}): void {
    const event: AnalyticsEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name,
      timestamp: new Date().toISOString(),
      metadata,
    };

    // Keep events array bounded
    this.events = [event, ...this.events].slice(0, this.maxStoredEvents);

    // Console logging with readable styling
    console.log(`[ANALYTICS] 📊 [${event.name}]`, {
      timestamp: event.timestamp,
      ...metadata,
    });

    // Notify active listeners (e.g. in-app log screen)
    this.listeners.forEach((listener) => listener(event));
  }

  /**
   * Retrieve all recorded events
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Clear recorded events
   */
  clearEvents(): void {
    this.events = [];
    this.notifyListeners();
  }

  /**
   * Subscribe to real-time analytics updates
   */
  subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const lastEvent = this.events[0];
    if (lastEvent) {
      this.listeners.forEach((listener) => listener(lastEvent));
    }
  }
}

export const analytics = new AnalyticsService();
