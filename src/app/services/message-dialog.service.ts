import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageDialogComponent } from '../shared/message-dialog/message-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class MessageDialogService {

  constructor(private modalService: NgbModal) {}

  showError(message: string) {
    alert(message); // or use toast/snackbar
  }

  openDialog(
    title: string,
    message: string,
    confirmText: string = 'OK',
    type: 'info' | 'error' = 'info'
  ) {
    const modalRef = this.modalService.open(MessageDialogComponent, {
      centered: true,
      backdrop: 'static'
    });

    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.confirmText = confirmText;
    modalRef.componentInstance.modalType = type;
    modalRef.componentInstance.showCancel = false;

    return modalRef.result;
  }

  openConfirmDialog(
    title: string,
    message: string,
    confirmText: string = 'Delete',
    cancelText: string = 'Cancel'
  ) {
    const modalRef = this.modalService.open(MessageDialogComponent, {
      centered: true,
      backdrop: 'static'
    });

    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.confirmText = confirmText;
    modalRef.componentInstance.cancelText = cancelText;
    modalRef.componentInstance.showCancel = true;
    modalRef.componentInstance.modalType = 'delete';

    return modalRef.result.then(
      () => true,
      () => false
    );
  }
}
