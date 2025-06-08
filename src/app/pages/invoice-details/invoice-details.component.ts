import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';
import { Invoice } from '../../models/invoice.model';

@Component({
  selector: 'app-invoice-details',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.scss']
})
export class InvoiceDetailsComponent {
  @Input () invoice?: Invoice;
  isEditModalOpen = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.invoiceService.getInvoices().subscribe(invoices => {
        this.invoice = invoices.find(inv => inv.id === id);
        if (!this.invoice) {
          this.router.navigate(['/invoices']);
        }
      });
    }

    // Listen for modal outlet activation
    this.route.children.forEach(child => {
      if (child.outlet === 'modal') {
        this.isEditModalOpen = true;
        child.url.subscribe(() => {
          this.isEditModalOpen = child.component !== null;
        });
      }
    });
  }

  openEditOverlay() {
    this.isEditModalOpen = true;
    this.router.navigate(
      [{ outlets: { modal: ['edit'] } }],
      { relativeTo: this.route }
    );
  }

  closeEditOverlay() {
    this.isEditModalOpen = false;
    this.router.navigate(
      [{ outlets: { modal: null } }],
      { relativeTo: this.route }
    );
  }

  markAsPaid() {
    if (this.invoice) {
      this.invoice.status = 'paid';
    }
  }
}