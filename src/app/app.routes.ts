import { Routes } from '@angular/router';
import { InvoiceListComponent } from './pages/invoice-list/invoice-list.component';
import { InvoiceDetailsComponent } from './pages/invoice-details/invoice-details.component';
import { NewInvoiceFormComponent } from './pages/new-invoice-form/new-invoice-form.component';
import { EditInvoiceComponent } from './pages/edit-invoice/edit-invoice.component';

export const routes: Routes = [
  { path: '', redirectTo: '/invoices', pathMatch: 'full' },
  { path: 'invoices', component: InvoiceListComponent },
  { path: 'invoices/new', component: InvoiceListComponent }, 
  { path: 'invoices/:id', component: InvoiceDetailsComponent },
  { path: 'invoices/:id/edit', component: EditInvoiceComponent }
];
