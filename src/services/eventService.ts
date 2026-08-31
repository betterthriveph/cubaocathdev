/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Immaculate Conception Cathedral of Cubao
 * Liturgical & Event Calendar Service Layer
 * 
 * Manages Parish Events, Solemnities, Seminars, and Liturgical Calendar entries.
 * Prepared for Netlify Database / REST API integration.
 */

import { ParishEvent } from '../types';
import { DEV_MOCK_PARISH_EVENTS } from '../data/mockData';

const STORAGE_KEY = 'cathedral_events_cms';
const EVENTS_CHANGE_EVENT = 'cathedral_events_changed';

class EventService {
  private getStorage(): ParishEvent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load events from storage:', e);
    }
    // Initialize storage if empty
    this.saveStorage(DEV_MOCK_PARISH_EVENTS);
    return DEV_MOCK_PARISH_EVENTS;
  }

  private saveStorage(events: ParishEvent[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
      window.dispatchEvent(new CustomEvent(EVENTS_CHANGE_EVENT, { detail: events }));
    } catch (e) {
      console.error('Failed to save events to storage:', e);
    }
  }

  getAllEvents(): ParishEvent[] {
    return this.getStorage();
  }

  getEventById(id: string): ParishEvent | undefined {
    const events = this.getStorage();
    return events.find(e => e.id === id);
  }

  createEvent(eventData: Omit<ParishEvent, 'id'> & { id?: string }): ParishEvent {
    const events = this.getStorage();
    const newEvent: ParishEvent = {
      ...eventData,
      id: eventData.id || `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    const updated = [newEvent, ...events];
    this.saveStorage(updated);
    return newEvent;
  }

  updateEvent(id: string, updates: Partial<ParishEvent>): boolean {
    const events = this.getStorage();
    const index = events.findIndex(e => e.id === id);
    if (index === -1) return false;

    events[index] = {
      ...events[index],
      ...updates,
    };
    this.saveStorage(events);
    return true;
  }

  deleteEvent(id: string): boolean {
    const events = this.getStorage();
    const filtered = events.filter(e => e.id !== id);
    if (filtered.length === events.length) return false;

    this.saveStorage(filtered);
    return true;
  }

  resetToDefaults(): void {
    this.saveStorage(DEV_MOCK_PARISH_EVENTS);
  }

  subscribe(listener: (events: ParishEvent[]) => void): () => void {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<ParishEvent[]>;
      listener(customEvent.detail || this.getAllEvents());
    };
    window.addEventListener(EVENTS_CHANGE_EVENT, handler);
    return () => window.removeEventListener(EVENTS_CHANGE_EVENT, handler);
  }
}

export const eventService = new EventService();
