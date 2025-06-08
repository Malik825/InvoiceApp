// invoice.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Invoice } from '../models/invoice.model';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private dataUrl = '/assets/data/data.json';
  private localStorageKey = 'invoices';

  constructor(private http: HttpClient) {}

getInvoices(): Observable<Invoice[]> {
  const localData = this.getStoredInvoices();
  if (localData.length > 0) {
    // Return invoices from localStorage
    return of(localData);
  } else {
    // If empty, load from JSON file then save to localStorage
    return this.http.get<Invoice[]>(this.dataUrl).pipe(
      tap(data => this.saveInvoices(data)),
      catchError(err => {
        console.error('Failed to load invoices from JSON', err);
        return of([]); // Return empty array on error
      })
    );
  }
}


  getStoredInvoices(): Invoice[] {
    const data = localStorage.getItem(this.localStorageKey);
    return data ? JSON.parse(data) : [];
  }

  saveInvoices(invoices: Invoice[]) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(invoices));
  }

addInvoice(invoice: Invoice): void {
  const invoices = this.getStoredInvoices();

  // ✅ Ensure a unique ID is generated
  if (!invoice.id || invoice.id.trim() === '') {
    invoice.id = this.generateId();
  }

  invoices.push(invoice);
  this.saveInvoices(invoices);
}


  updateInvoice(updated: Invoice) {
    const invoices = this.getStoredInvoices();
    const index = invoices.findIndex(inv => inv.id === updated.id);
    if (index !== -1) {
      invoices[index] = updated;
      this.saveInvoices(invoices);
    }
  }

  deleteInvoice(id: string) {
    const invoices = this.getStoredInvoices().filter(inv => inv.id !== id);
    this.saveInvoices(invoices);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  calculateTotal(items: { quantity: number; price: number }[]): number {
  return items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
}

}
