import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';
import { Invoice } from '../../models/invoice.model';
import { NewInvoiceFormComponent } from '../new-invoice-form/new-invoice-form.component';
import { InvoiceDetailsComponent } from "../invoice-details/invoice-details.component";

@Component({
  selector: 'app-edit-invoice',
  standalone: true,
  imports: [CommonModule, RouterModule, NewInvoiceFormComponent, InvoiceDetailsComponent],
  templateUrl: './edit-invoice.component.html',
  styleUrls: ['./edit-invoice.component.scss']
})
export class EditInvoiceComponent {
  @Input() invoiceData?: Invoice;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.invoiceService.getInvoices().subscribe(invoices => {
        this.invoiceData = invoices.find(inv => inv.id === id);
        if (!this.invoiceData) {
          this.router.navigate(['/invoices']);
        }
      });
    } else {
      // No id param, redirect to invoice list
      this.router.navigate(['/invoices']);
    }
  }

  onClose() {
    if (this.invoiceData?.id) {
      this.router.navigate(['/invoices', this.invoiceData.id]);
    } else {
      this.router.navigate(['/invoices']);
    }
  }

  onSave(updatedInvoice: Invoice) {
    // After saving, navigate to invoice detail page
    this.router.navigate(['/invoices', updatedInvoice.id]);
  }
}
