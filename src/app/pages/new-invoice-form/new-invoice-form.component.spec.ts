import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewInvoiceFormComponent } from './new-invoice-form.component';

describe('NewInvoiceFormComponent', () => {
  let component: NewInvoiceFormComponent;
  let fixture: ComponentFixture<NewInvoiceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewInvoiceFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewInvoiceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
