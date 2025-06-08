import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  OnInit
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Invoice } from '../../models/invoice.model';
import { IonicModule } from '@ionic/angular';
import { InvoiceService } from '../../services/invoice.service';

@Component({
  selector: 'app-new-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  templateUrl: './new-invoice-form.component.html',
  styleUrls: ['./new-invoice-form.component.scss']
})
export class NewInvoiceFormComponent implements OnInit, OnChanges {
  @Input() formData?: Invoice;
  @Input() isEditMode = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Invoice>();

  invoiceForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService
  ) {
    this.invoiceForm = this.createForm();
  }

  ngOnInit(): void {
    if (!this.isEditMode && !this.formData) {
      this.loadDraft();
    }

    setInterval(() => {
      if (!this.isEditMode && this.invoiceForm.dirty) {
        this.saveDraft();
      }
    }, 30000);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formData'] && this.formData) {
      this.patchForm(this.formData);
    }
  }

  private createForm(): FormGroup {
    const form = this.fb.group({
      senderAddress: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        postCode: ['', Validators.required],
        country: ['', Validators.required],
      }),
      clientName: ['', Validators.required],
      clientEmail: ['', [Validators.required, Validators.email]],
      clientAddress: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        postCode: ['', Validators.required],
        country: ['', Validators.required],
      }),
      createdAt: [new Date().toISOString().split('T')[0], Validators.required],
      paymentDue: ['', Validators.required],
      description: ['', Validators.required],
      paymentTerms: [30, [Validators.required, Validators.min(1)]],
      status: ['draft', Validators.required],
      items: new FormArray<FormGroup>([this.createItem()]),
      total: [{ value: 0, disabled: true }],
      id: ['']
    });

    form.get('items')?.valueChanges.subscribe(() => this.updateTotal());
    form.get('createdAt')?.valueChanges.subscribe(() => this.updatePaymentDue());
    form.get('paymentTerms')?.valueChanges.subscribe(() => this.updatePaymentDue());

    return form;
  }

  get items(): FormArray<FormGroup> {
    return this.invoiceForm.get('items') as FormArray<FormGroup>;
  }

  createItem(): FormGroup {
    const itemGroup = this.fb.group({
      name: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      total: [{ value: 0, disabled: true }]
    });

    itemGroup.get('quantity')?.valueChanges.subscribe(() => this.updateItemTotal(itemGroup));
    itemGroup.get('price')?.valueChanges.subscribe(() => this.updateItemTotal(itemGroup));

    return itemGroup;
  }

  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
      this.updateTotal();
    }
  }

  private updateItemTotal(itemGroup: FormGroup): void {
    const quantity = itemGroup.get('quantity')?.value || 0;
    const price = itemGroup.get('price')?.value || 0;
    const total = quantity * price;
    itemGroup.get('total')?.setValue(total, { emitEvent: false });
    this.updateTotal();
  }

  updateTotal(): void {
    const total = this.invoiceService.calculateTotal(this.items.value);
    this.invoiceForm.get('total')?.setValue(total, { emitEvent: false });
  }

  private updatePaymentDue(): void {
    const createdAt = this.invoiceForm.get('createdAt')?.value;
    const paymentTerms = this.invoiceForm.get('paymentTerms')?.value;

    if (createdAt && paymentTerms) {
      const dueDate = new Date(createdAt);
      dueDate.setDate(dueDate.getDate() + paymentTerms);
      this.invoiceForm.get('paymentDue')?.setValue(
        dueDate.toISOString().split('T')[0],
        { emitEvent: false }
      );
    }
  }

  patchForm(data: Invoice): void {
    while (this.items.length !== 0) {
      this.items.removeAt(0);
    }

    data.items.forEach(item => {
      const group = this.createItem();
      group.patchValue(item);
      this.items.push(group);
    });

    this.invoiceForm.patchValue({
      ...data,
      total: data.total || 0
    });

    this.updateTotal();
  }

  onSubmit(): void {
    if (this.invoiceForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formValue = this.invoiceForm.getRawValue() as Invoice;

      formValue.items = formValue.items.map(item => ({
        ...item,
        total: item.quantity * item.price
      }));

      formValue.total = this.invoiceService.calculateTotal(formValue.items);

      if (this.isEditMode && formValue.id) {
        this.invoiceService.updateInvoice(formValue);
      } else {
        this.invoiceService.addInvoice(formValue);
      }

      if (!this.isEditMode) {
        this.clearDraft();
      }

      this.save.emit(formValue);
      this.isSubmitting = false;
    } else {
      this.invoiceForm.markAllAsTouched();
      this.highlightErrors();
    }
  }

  onSaveAsDraft(): void {
    const formValue = this.invoiceForm.getRawValue() as Invoice;
    formValue.status = 'draft';

    formValue.items = formValue.items.map(item => ({
      ...item,
      total: item.quantity * item.price
    }));
    formValue.total = this.invoiceService.calculateTotal(formValue.items);

    if (!formValue.id) {
      this.invoiceService.addInvoice(formValue);
    } else {
      this.invoiceService.updateInvoice(formValue);
    }

    this.clearDraft();
    this.save.emit(formValue);
  }

  onCancel(): void {
    if (this.invoiceForm.dirty && !this.isEditMode) {
      this.saveDraft();
    }
    this.close.emit();
  }

  // Draft management
  private saveDraft(): void {
    if (this.invoiceForm.valid) {
      const draftData = this.invoiceForm.getRawValue();
      localStorage.setItem('invoiceDraft', JSON.stringify(draftData));
    }
  }

  private loadDraft(): void {
    const draft = localStorage.getItem('invoiceDraft');
    if (draft) {
      try {
        const draftData = JSON.parse(draft);
        this.patchForm(draftData);
      } catch (error) {
        console.error('Error loading draft:', error);
        localStorage.removeItem('invoiceDraft');
      }
    }
  }

  private clearDraft(): void {
    localStorage.removeItem('invoiceDraft');
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string, groupName?: string): boolean {
    const control = groupName
      ? this.invoiceForm.get(groupName)?.get(fieldName)
      : this.invoiceForm.get(fieldName);
    return !!(control?.invalid && (control?.touched || control?.dirty));
  }

  getFieldError(fieldName: string, groupName?: string): string {
    const control = groupName
      ? this.invoiceForm.get(groupName)?.get(fieldName)
      : this.invoiceForm.get(fieldName);

    if (control?.errors) {
      if (control.errors['required']) return `${fieldName} is required`;
      if (control.errors['email']) return 'Please enter a valid email';
      if (control.errors['min']) return `${fieldName} must be greater than 0`;
    }
    return '';
  }

  private highlightErrors(): void {
    setTimeout(() => {
      const firstError = document.querySelector('.ng-invalid.ng-touched');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }
}
