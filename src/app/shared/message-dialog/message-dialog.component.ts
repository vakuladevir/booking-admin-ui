import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss']
})
export class MessageDialogComponent {
  @Input() title: string = 'Message';
  @Input() message: string = '';
  @Input() confirmText: string = 'OK';

  constructor(public activeModal: NgbActiveModal) {}

  closeDialog() {
    this.activeModal.close();
  }
}
