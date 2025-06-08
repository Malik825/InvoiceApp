import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';
import { Invoice } from '../../models/invoice.model';
import { NewInvoiceFormComponent } from '../new-invoice-form/new-invoice-form.component';
import { DueDatePipe } from '../../shared/due-date.pipe';
import { HighlightOverdueDirective } from '../../shared/highlight-overdue.directive';
import { Sidebar } from '../../components/sidebar/sidebar.component';
import { filter } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NewInvoiceFormComponent,
    Sidebar,
    DueDatePipe,
    HighlightOverdueDirective,
    FormsModule,
    
  ],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  isNewModalOpen = false;

  // Multi-select statuses filter
  selectedStatuses: string[] = [];

  statuses = [
    { label: 'Paid', value: 'paid' },
    { label: 'Pending', value: 'pending' },
    { label: 'Draft', value: 'draft' }
  ];
  isFilterOpen = false;
toggleFilter() {
    this.isFilterOpen = !this.isFilterOpen;
  }
  constructor(
    private invoiceService: InvoiceService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadInvoices();

    this.route.url.subscribe(() => {
      this.isNewModalOpen = this.router.url.endsWith('/new');
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => this.loadInvoices());
  }

  loadInvoices() {
    this.invoiceService.getInvoices().subscribe((data) => {
      this.invoices = data;
      this.applyFilter();
    });
  }

  toggleTheme(): void {
    document.body.classList.toggle('dark-theme');
  }

  onCheckboxChange(status: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedStatuses.push(status);
    } else {
      this.selectedStatuses = this.selectedStatuses.filter(s => s !== status);
    }
    this.applyFilter();
  }

  applyFilter() {
    if (this.selectedStatuses.length === 0) {
      this.filteredInvoices = this.invoices;
    } else {
      this.filteredInvoices = this.invoices.filter(inv =>
        this.selectedStatuses.includes(inv.status)
      );
    }
  }

  deleteInvoice(id: string) {
    this.invoiceService.deleteInvoice(id);
    this.loadInvoices();
  }

  closeModal() {
    this.router.navigate(['/invoices']);
  }

  handleInvoiceSaved(newInvoice: Invoice) {
    const index = this.invoices.findIndex(inv => inv.id === newInvoice.id);

    if (index !== -1) {
      this.invoiceService.updateInvoice(newInvoice);
    } else {
      this.invoiceService.addInvoice(newInvoice);
    }

    this.loadInvoices();
    this.closeModal();
  }
  
}
