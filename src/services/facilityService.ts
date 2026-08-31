/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Immaculate Conception Cathedral of Cubao
 * Facility Data & CMS Service Layer
 * 
 * Manages Cathedral Facilities specifications, hero banner images,
 * and photo galleries. Enables staff to update images dynamically via Admin CMS.
 * Prepared for Netlify Database / REST API integration.
 */

import { Facility } from '../types';
import { DEV_MOCK_FACILITIES } from '../data/mockData';

const STORAGE_KEY = 'cathedral_facilities_cms';
const FACILITIES_CHANGE_EVENT = 'cathedral_facilities_changed';

class FacilityService {
  private getStorage(): Facility[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load facilities from storage:', e);
    }
    // Initialize storage if empty
    this.saveStorage(DEV_MOCK_FACILITIES);
    return DEV_MOCK_FACILITIES;
  }

  private saveStorage(facilities: Facility[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(facilities));
      window.dispatchEvent(new CustomEvent(FACILITIES_CHANGE_EVENT, { detail: facilities }));
    } catch (e) {
      console.error('Failed to save facilities to storage:', e);
    }
  }

  getAllFacilities(): Facility[] {
    return this.getStorage();
  }

  getFacilityById(id: string): Facility | undefined {
    const facilities = this.getStorage();
    return facilities.find(f => f.id === id);
  }

  updateFacilityHeroImage(id: string, heroImage: string): boolean {
    const facilities = this.getStorage();
    const index = facilities.findIndex(f => f.id === id);
    if (index === -1) return false;

    facilities[index] = {
      ...facilities[index],
      heroImage,
    };
    this.saveStorage(facilities);
    return true;
  }

  updateFacilityGallery(id: string, gallery: string[]): boolean {
    const facilities = this.getStorage();
    const index = facilities.findIndex(f => f.id === id);
    if (index === -1) return false;

    facilities[index] = {
      ...facilities[index],
      gallery,
    };
    this.saveStorage(facilities);
    return true;
  }

  updateFacility(id: string, updates: Partial<Facility>): boolean {
    const facilities = this.getStorage();
    const index = facilities.findIndex(f => f.id === id);
    if (index === -1) return false;

    facilities[index] = {
      ...facilities[index],
      ...updates,
    };
    this.saveStorage(facilities);
    return true;
  }

  resetToDefaults(): void {
    this.saveStorage(DEV_MOCK_FACILITIES);
  }

  subscribe(listener: (facilities: Facility[]) => void): () => void {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<Facility[]>;
      listener(customEvent.detail || this.getAllFacilities());
    };
    window.addEventListener(FACILITIES_CHANGE_EVENT, handler);
    return () => window.removeEventListener(FACILITIES_CHANGE_EVENT, handler);
  }
}

export const facilityService = new FacilityService();
