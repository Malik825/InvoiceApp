import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appHighlightOverdue]',
  standalone: true
})
export class HighlightOverdueDirective implements OnInit {
  @Input('appHighlightOverdue') dueDate!: string;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    const due = new Date(this.dueDate);
    const now = new Date();
    if (due < now) {
      this.el.nativeElement.style.borderLeft = '4px solid red';
      this.el.nativeElement.style.paddingLeft = '0.5rem';
    }
  }
}
