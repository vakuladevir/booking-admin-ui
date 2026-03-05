import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PartnerMasterVO } from 'src/app/model/partnerMasterVO.model';
import { ParnterMasterService } from 'src/app/services/partnerMaster.service';
import { GeneralRespVO } from 'src/app/model/generalRespVO.model';
import { MessageDialogService } from 'src/app/services/message-dialog.service';

import { Router } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-partner-master',
  templateUrl: './partner-master.component.html',
  styleUrls: ['./partner-master.component.scss']
})
export class PartnerMasterComponent implements OnInit {

  isShow: boolean = false;
  isCreate: boolean = false;
  isUpdate: boolean = false;
  isDelete: boolean = false;
  isListView: boolean = false; 
  isView: boolean = false;
  partnerForm!: FormGroup;
  bpNumber: string = '';
  bpNumbersArr: string[] = []; // Replace with API data
  filteredBpNumbersArr: string[] = [];
  partnerObj: PartnerMasterVO = new PartnerMasterVO();
  districts: string[] = [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
    "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kancheepuram",
    "Kanniyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
    "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
    "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
    "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
    "Tirupattur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
    "Vellore", "Viluppuram", "Virudhunagar"
  ];

  partners: any[] = [];  // Store fetched partners
  filteredPartners: any[] = []; // Store search results
  searchText: string = ''; // Bind search input

  constructor(private formBuilder: FormBuilder,
    private messageDialog: MessageDialogService,
    private partnerService: ParnterMasterService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.partnerService.getAllBpNo().subscribe((data) => {
      this.bpNumbersArr = data;
      this.filteredBpNumbersArr = data;
    });
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
  }

  initializeForm() {
    this.partnerForm = this.formBuilder.group({
      partnerName: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      businessBackground: ['', Validators.required],
      partnerType: ['', Validators.required],
      experienceYears: ['',  [Validators.required, Validators.min(0)]],
      region: ['', Validators.required],
      mobileNo: ['', [Validators.required, Validators.pattern('^[6-9]\\d{9}$')]],
      emailId: ['', [Validators.required, Validators.email]],
      aadhaarNo: ['', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
      panNo: ['', [Validators.required, Validators.pattern('^[A-Z]{5}[0-9]{4}[A-Z]{1}$')]],
      drivingLicense: ['', [Validators.required, Validators.pattern('^[A-Z]{2}[0-9]{13}$')]],
      companyName: ['', Validators.required],
      companyAddress: ['', Validators.required],
      companyCity: ['', Validators.required],
      companyState: ['', Validators.required],
      companyPincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      companyMobileNo: ['', [Validators.required, Validators.pattern('^[6-9]\\d{9}$')]],
      companyEmailId: ['', [Validators.required, Validators.email]],
      isGst: [false],
      gstNo: [''],
      isAddressProof: [false],
      managerName: ['', Validators.required],
      managerMobileNo: ['', [Validators.required, Validators.pattern('^[6-9]\\d{9}$')]],
      managerEmailId: ['', [Validators.required, Validators.email]],
      isDocumentsSubmitted: [false]
    });

    this.partnerForm.get('isGst')?.valueChanges.subscribe((isGst: boolean) => {
      const gstNoControl = this.partnerForm.get('gstNo');
      if (isGst) {
        gstNoControl?.setValidators([Validators.required, Validators.pattern('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')]);
      } else {
        gstNoControl?.clearValidators();
        gstNoControl?.setValue(''); // Clear GST No when not applicable
      }
      gstNoControl?.updateValueAndValidity();
    });
  }

  onLoadPartner() {
    this.isShow = true;
    this.isCreate = true;
    this.isUpdate = false;
    this.isDelete = false;
    this.isListView = false;
    this.initializeForm();
  }

  onCreate() {

    if (this.partnerForm.valid) {
      this.partnerObj = Object.assign({}, this.partnerForm.value);
      this.partnerService.createPartner(this.partnerObj)
        .subscribe(
          (resp: GeneralRespVO) => {
            if (resp.message === "Success") {
              let message = 'Partner Creation Successfull!! ' + resp.subMessage;
              this.messageDialog.openDialog('Info', message, 'Ok');
              this.partnerForm.reset();
              this.partnerService.getAllBpNo().subscribe((data) => {
                this.bpNumbersArr = data;
              });
            } else {
              this.messageDialog.openDialog('Error', 'Please verify your info', 'Close');
              this.partnerForm.reset();
            }

          })
    } else {
      this.messageDialog.openDialog('Error', 'Please fill out all the fields', 'Close');
      this.partnerForm.markAllAsTouched();
    }
  }

  // search = (text$: Observable<string>) =>
  //   text$.pipe(
  //     debounceTime(300), // Wait for user to stop typing
  //     distinctUntilChanged(), // Ignore repeated searches
  //     map(term => term.length < 2 ? []
  //       : this.bpNumbersArr.filter(bp => bp.toLowerCase().includes(term.toLowerCase())).slice(0, 10)) // Filter BP Numbers
  //   );

  onSearchPartner() {
    this.isCreate = false;
    this.isUpdate = true;
    this.isDelete = true;
    this.isView = false;
    this.isListView = false;
    this.initializeForm();

    if (!this.bpNumber) {
      alert('Please enter BP Number!');
      return;
    }

    this.partnerService.getPartnerByBpNo(this.bpNumber).subscribe((data) => {
      if (data) {
        this.partnerForm.patchValue(data);
        this.isShow = true; // Show form with details
      } else {
        alert('No partner found with this BP Number!');
      }
    });
  }

  onUpdate() {
    if (this.partnerForm.valid) {
      this.partnerObj = Object.assign({}, this.partnerForm.value);
      this.partnerService.updatePartner(this.bpNumber, this.partnerObj)
        .subscribe(
          (resp: GeneralRespVO) => {
            if (resp.message === "Success") {
              let message = 'Partner Updation Successfull!! ' + resp.subMessage;
              this.messageDialog.openDialog('Info', message, 'Ok');
            } else {
              this.messageDialog.openDialog('Error', 'Please verify your info', 'Close');
              this.bpNumber = '';
              this.partnerForm.reset();
            }

          })
    } else {
      this.messageDialog.openDialog('Error', 'Please fill out all the fields', 'Close');
      this.partnerForm.markAllAsTouched();
    }
  }

  onView(bpNo: string) {
    this.bpNumber = bpNo;
    this.isCreate = false;
    this.isUpdate = false;
    this.isDelete = false;
    this.isListView = false;
    this.isView = true;
    this.initializeForm();
    this.partnerService.getPartnerByBpNo(this.bpNumber).subscribe((data) => {
      if (data) {
        this.partnerForm.patchValue(data);
        this.isShow = true; // Show form with details
      }
    });
  }

  onDelete() {
    this.partnerService.deletePartner(this.bpNumber)
      .subscribe(
        (resp: string) => {
          this.messageDialog.openDialog('Info', resp, 'Ok');
          this.partnerForm.reset();
          this.bpNumber = '';
        })
  }

  onLoadPartnerList() {
    this.isListView = true; // Show table
    this.isCreate = false;
    this.isUpdate = false;
    this.isShow = false;
    this.isView = false;

    this.partnerService.getAllPartner().subscribe((data) => {
      this.partners = data;
      this.filteredPartners = data; // Initialize filtered data
      
    });
  }

  onSearchChange() {
    this.filteredPartners = this.partners.filter(partner =>
      partner.partnerName.toLowerCase().includes(this.searchText.toLowerCase()) ||
      partner.region.toLowerCase().includes(this.searchText.toLowerCase()) ||
      partner.companyName.toLowerCase().includes(this.searchText.toLowerCase()) || 
      partner.companyMobileNo.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  onBack() {
    this.partnerForm.reset();
    this.bpNumber = '';
    this.onLoadPartnerList();
  }

  onNavigateHome() {
    this.router.navigate(['/home']);
  }
}



