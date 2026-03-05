import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageDialogService } from 'src/app/services/message-dialog.service';
import { ParnterMasterService } from 'src/app/services/partnerMaster.service';

import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { ParnterBankService } from 'src/app/services/partnerBank.service';
import { PartnerBankVO } from 'src/app/model/partnerBankVO.model';
import { GeneralRespVO } from 'src/app/model/generalRespVO.model';

@Component({
  selector: 'app-partner-bank',
  templateUrl: './partner-bank.component.html',
  styleUrls: ['./partner-bank.component.scss']
})
export class PartnerBankComponent implements OnInit {

  partnerBankForm!: FormGroup;
  bpNumber: string = '';
  bpNumbersArr: string[] = [];
  filteredBpNumbersArr: string[] = [];
  isCreate: boolean = false;
  isUpdate: boolean = false;
  isDelete: boolean = false;
  isView: boolean = false;
  partnerBank: PartnerBankVO = new PartnerBankVO();

  constructor(private fb: FormBuilder,
    private messageDialog: MessageDialogService,
    private partnerService: ParnterMasterService,
    private partnerBankService: ParnterBankService,
    private router: Router) { }

  ngOnInit(): void {
    this.partnerBankForm = this.fb.group({
      partnerName: [{ value: '', disabled: true }],
      companyName: [{ value: '', disabled: true }],
      bankName: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$')]],
      accountNo: ['', [Validators.required, Validators.pattern('^[0-9]{9,18}$')]],
      beneficiaryName: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$')]],
      ifscCode: ['', [Validators.required, Validators.pattern('^[A-Z]{4}0[A-Z0-9]{6}$')]],
      accountType: ['', Validators.required]
    });

    this.partnerService.getAllBpNo().subscribe((data) => {
      this.bpNumbersArr = data;
      this.filteredBpNumbersArr = data;
    });
// ...existing code...
  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300), // Wait for user to stop typing
      distinctUntilChanged(), // Ignore repeated searches
      map(term => term.length < 2 ? []
        : this.bpNumbersArr.filter(bp => bp.toLowerCase().includes(term.toLowerCase())).slice(0, 10)) // Filter BP Numbers
    );

  onNavigateHome() {
    this.router.navigate(['/home']);
  }

  onSelectBP(event: Event): void {

    const selectedBP = (event.target as HTMLSelectElement).value;
    this.bpNumber = selectedBP;
    this.partnerBankService.getPartnerBankByBPCode(selectedBP).subscribe((data) => {
      if (data) {
        this.partnerBankForm.patchValue(data);
        if(this.partnerBankForm.value.accountNo) {
          this.isCreate = false;
          this.isUpdate = true;
          this.isView = true;
          this.isDelete = true;
        } else {
          this.isCreate = true;
          this.isUpdate = false;
          this.isView = false;
          this.isDelete = false;
        }
      } else {
        alert('No partner found with this BP Number!');
      }
    });
  }

  onCreate() {
    if (this.partnerBankForm.valid) {
      this.partnerBank = Object.assign({}, this.partnerBankForm.value);
      this.partnerBankService.createBank(this.bpNumber, this.partnerBank)
        .subscribe(
          (resp: GeneralRespVO) => {
            if (resp.message === "Success") {
              let message = 'Partner Bank Creation Successfull!!';
              this.messageDialog.openDialog('Info', message, 'Ok');
              this.bpNumber = '';
              this.partnerBankForm.reset();
            } else {
              this.messageDialog.openDialog('Error', 'Please verify your info', 'Close');
              this.bpNumber = '';
              this.partnerBankForm.reset();
            }
          })
    } else {
      this.partnerBankForm.markAllAsTouched();
      // Scroll to first error field (optional, for better UX)
      const firstError = document.querySelector('.text-danger');
      if (firstError) {
        (firstError as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      this.messageDialog.openDialog('Error', 'Please fill out all the fields with valid values', 'Close');
    }
  }

  onUpdate() {
    if (this.partnerBankForm.valid) {
      this.partnerBank = Object.assign({}, this.partnerBankForm.value);
      this.partnerBankService.updateBank(this.bpNumber, this.partnerBank)
        .subscribe(
          (resp: GeneralRespVO) => {
            if (resp.message === "Success") {
              let message = 'Partner Bank Updation Successfull!!';
              this.messageDialog.openDialog('Info', message, 'Ok');
            } else {
              this.messageDialog.openDialog('Error', 'Please verify your info', 'Close');
              this.bpNumber = '';
              this.partnerBankForm.reset();
            }
          })
    } else {
      this.partnerBankForm.markAllAsTouched();
      // Scroll to first error field (optional, for better UX)
      const firstError = document.querySelector('.text-danger');
      if (firstError) {
        (firstError as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      this.messageDialog.openDialog('Error', 'Please fill out all the fields with valid values', 'Close');
    }
  }

    onDelete() {
      this.partnerBankService.deleteBank(this.bpNumber)
        .subscribe(
          (resp: string) => {
            this.messageDialog.openDialog('Info', resp, 'Ok');
            this.bpNumber = '';
            this.partnerBankForm.reset();
          })
    }

    onBack() {
      this.bpNumber = '';
      this.partnerBankForm.reset();
    }


  onBpNumberInput() {
    if (!this.bpNumber) {
      this.filteredBpNumbersArr = this.bpNumbersArr;
      return;
    }
    const search = this.bpNumber.toLowerCase();
    this.filteredBpNumbersArr = this.bpNumbersArr.filter(bp => bp.toLowerCase().includes(search));
  }

  selectBpNumber(bp: string) {
    this.bpNumber = bp;
    this.filteredBpNumbersArr = [];
    // Optionally, trigger BP selection logic
    this.onSelectBP({ target: { value: bp } } as any);
  }
}
