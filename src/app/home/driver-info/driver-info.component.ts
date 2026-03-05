
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DriverInfoVO } from 'src/app/model/driverInfoVO.model';
import { GeneralRespVO } from 'src/app/model/generalRespVO.model';
import { VehicleDetailsVO } from 'src/app/model/vehicleDetailsVO.model';
import { DriverInfoService } from 'src/app/services/driverInfo.service';
import { MessageDialogService } from 'src/app/services/message-dialog.service';
import { ParnterMasterService } from 'src/app/services/partnerMaster.service';
import { VehicleService } from 'src/app/services/vehicle.service';


@Component({
  selector: 'app-driver-info',
  templateUrl: './driver-info.component.html',
  styleUrls: ['./driver-info.component.scss']
})
export class DriverInfoComponent implements OnInit {

  isShow: boolean = false;
  isCreate: boolean = false;
  isUpdate: boolean = false;
  isDelete: boolean = false;
  isListView: boolean = false; 
  isView: boolean = false;
  isEdit: boolean = false;
  driverForm!: FormGroup;
  bpNumber: string = '';
  bpNumbersArr: string[] = []; // Replace with API data
  filteredBpNumbersArr: string[] = [];
  isBpDropdownOpen: boolean = false;
  driverObj: DriverInfoVO = new DriverInfoVO();
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

  drivers: any[] = [];  // Store fetched partners
  filteredPartners: any[] = []; // Store search results
  searchText: string = ''; // Bind search input

  dCode: string = '';
  dCodeArr: string[] = [];
  dCodeInput: string = '';
  filteredDCodeArr: string[] = [];
  isDCodeDropdownOpen: boolean = false;
  onDCodeInput() {
    if (!this.dCodeInput) {
      this.filteredDCodeArr = this.dCodeArr;
      this.isDCodeDropdownOpen = false;
      return;
    }
    const search = this.dCodeInput.toLowerCase();
    this.filteredDCodeArr = this.dCodeArr.filter((code: string) => code.toLowerCase().includes(search));
    this.isDCodeDropdownOpen = this.filteredDCodeArr.length > 0;
  }

  selectDCode(code: string) {
    this.dCodeInput = code;
    this.dCode = code;
    this.filteredDCodeArr = [];
    this.isDCodeDropdownOpen = false;
  }

  closeDCodeDropdown() {
    setTimeout(() => { this.isDCodeDropdownOpen = false; }, 200);
  }

  constructor(private formBuilder: FormBuilder,
    private messageDialog: MessageDialogService,
    private driverService: DriverInfoService,
    private partnerService: ParnterMasterService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.partnerService.getAllBpNo().subscribe((data) => {
      this.bpNumbersArr = data;
      this.filteredBpNumbersArr = data;
    });

    this.driverService.getAllDriverCodes().subscribe((data) => {
      this.dCodeArr = data;
    });
  }

  initializeForm() {
    this.driverForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.pattern('^[A-Za-z ]{3,30}$')]], // 3-30 letters only
      address: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9 ,.-]{5,100}$')]], // 5-100 chars
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]], // 6 digits
      phoneNo: ['', [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]], // 10 digits, starts 6-9
      altPhoneNo: ['', [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
      age: [null, [Validators.required, Validators.min(18), Validators.max(75)]], // 18-75
      experience: ['', [Validators.pattern('^[0-9]{1,2}$')]], // 1-2 digits
      bloodGroup: ['', [Validators.pattern('^(A|B|AB|O)[+-]$')]], // A+, O-, etc.
      aadhaarNo: ['', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
      panNo: ['', [Validators.required, Validators.pattern('^[A-Z]{5}[0-9]{4}[A-Z]{1}$')]],
      drivingLicense: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9]{15,20}$')]],
      partnerId: [''],
      bpCode: ['', Validators.required],
      partnerName: [{ value: '', disabled: true }],
      isDocumentsSubmitted: [false],
    });
  }
  onBpNumberInput(event?: any) {
    // Keep bpNumber and bpCode in sync with input value
    if (event && event.target) {
      this.bpNumber = event.target.value;
      this.driverForm.get('bpCode')?.setValue(this.bpNumber);
    } else {
      this.bpNumber = this.driverForm.get('bpCode')?.value || '';
    }
    if (!this.bpNumber) {
      this.filteredBpNumbersArr = this.bpNumbersArr;
      this.isBpDropdownOpen = false;
      return;
    }
    const search = this.bpNumber.toLowerCase();
    this.filteredBpNumbersArr = this.bpNumbersArr.filter(bp => bp.toLowerCase().includes(search));
    this.isBpDropdownOpen = this.filteredBpNumbersArr.length > 0;
  }

  selectBpNumber(bp: string) {
    // Set the BP Code in the input and form
    this.bpNumber = bp;
    this.driverForm.get('bpCode')?.setValue(bp); // Set BP Code string
    this.filteredBpNumbersArr = [];
    this.isBpDropdownOpen = false;
    // Fetch partner details and set partnerId and partnerName
    this.partnerService.getPartnerByBpNo(bp).subscribe((data) => {
      if (data) {
        this.driverForm.get('partnerName')?.setValue(data.partnerName);
        this.driverForm.get('partnerId')?.setValue(data.partnerId); // Numeric ID
      } else {
        this.driverForm.get('partnerName')?.setValue('');
        this.driverForm.get('partnerId')?.setValue('');
        alert('No partner found with this BP Number!');
      }
    });
  }

  closeBpDropdown() {
    this.driverForm?.get('partnerId')?.markAsTouched();
    setTimeout(() => { this.isBpDropdownOpen = false; }, 200);
  }

  onLoadCreate() {
    this.isShow = true;
    this.isCreate = true;
    this.isUpdate = false;
    this.isDelete = false;
    this.isListView = false;
    this.initializeForm();
    this.isEdit = true;
    this.bpNumber = '';
    this.dCode = '';
  }

  onCreate() {

    if (this.driverForm.valid) {
      this.driverObj = Object.assign({}, this.driverForm.value);
      this.driverService.createDriver(this.driverObj)
        .subscribe(
          (resp: GeneralRespVO) => {
            if (resp.message === "Success") {
              let message = 'Driver Creation Successfull!! ' + resp.subMessage;
              this.messageDialog.openDialog('Info', message, 'Ok');
              this.driverForm.reset();
              this.bpNumber = '';
              this.driverService.getAllDriverCodes().subscribe((data) => {
                this.dCodeArr = data;
              });
            } else {
              this.messageDialog.openDialog('Error', 'Please verify your info', 'Close');
              this.driverForm.reset();
              this.bpNumber = '';
            }

          })
    } else {
      this.messageDialog.openDialog('Error', 'Please fill out all the fields', 'Close');
      this.driverForm.markAllAsTouched();
    }
  }


  onSelectBP(event: Event): void {

    const selectedBP = (event.target as HTMLSelectElement).value;;
    this.bpNumber = selectedBP;
    this.partnerService.getPartnerByBpNo(selectedBP).subscribe((data) => {
      if (data) {
        this.driverForm.get('partnerName')?.setValue(data.partnerName);
        this.driverForm.get('partnerId')?.setValue(data.partnerId);
      } else {
        alert('No partner found with this BP Number!');
      }
    });
  }

  onSearchDriverCode() {
    this.isCreate = false;
    this.isUpdate = true;
    this.isDelete = true;
    this.isView = true;
    this.isListView = false;
    this.initializeForm();
    this.isEdit = false;

    if (!this.dCode) {
      alert('Please enter driver Code!');
      return;
    }

    this.driverService.getDriverByCode(this.dCode).subscribe((data) => {
      if (data) {
        this.driverForm.patchValue(data);
        this.bpNumber = data.bpCode;
        this.driverForm.get('partnerId')?.setValue(data.partnerId)
        this.driverForm.get('partnerName')?.setValue(data.partnerName)
        if (data.drivingLicense) {
          this.driverForm.get('drivingLicense')?.setValue(data.drivingLicense);
        }
        this.isShow = true; // Show form with details
      } else {
        alert('No Vehicle found with this Vehicle Code!');
      }
    });
  }

  onUpdate() {
    if (this.driverForm.valid) {
      this.driverObj = Object.assign({}, this.driverForm.value);
      this.driverService.updateDriver(this.dCode, this.driverObj)
        .subscribe(
          (resp: GeneralRespVO) => {
            if (resp.message === "Success") {
              let message = 'Driver Updation Successfull!! ' + resp.subMessage;
              this.messageDialog.openDialog('Info', message, 'Ok');
            } else {
              this.messageDialog.openDialog('Error', 'Please verify your info', 'Close');
              this.bpNumber = '';
              this.driverForm.reset();
            }

          })
    } else {
      this.messageDialog.openDialog('Error', 'Please fill out all the fields', 'Close');
      this.driverForm.markAllAsTouched();
    
    }
  }

  onView(dCode: string) {
    this.dCode = dCode;
    this.isCreate = false;
    this.isUpdate = false;
    this.isDelete = false;
    this.isListView = false;
    this.isView = true;
    this.initializeForm();
    this.driverService.getDriverByCode(this.dCode).subscribe((data) => {
      if (data) {
        this.driverForm.patchValue(data);
        this.bpNumber = data.bpCode;
        if (data.drivingLicenseNo) {
          this.driverForm.get('drivingLicenseNo')?.setValue(data.drivingLicenseNo);
        }
        this.isShow = true; // Show form with details
      }
    });
  }

  onDelete() {
    this.driverService.deleteDriver(this.dCode)
      .subscribe(
        (resp: string) => {
          this.messageDialog.openDialog('Info', resp, 'Ok');
          this.driverForm.reset();
          this.bpNumber = '';
        })
  }

  onLoadDriverList() {
    this.isListView = true; // Show table
    this.isCreate = false;
    this.isUpdate = false;
    this.isShow = false;
    this.isView = false;

    this.driverService.getAllDrivers().subscribe((data) => {
      this.drivers = data;
      this.filteredPartners = data; // Initialize filtered data
      
    });
  }

  onSearchChange() {
    this.filteredPartners = this.drivers.filter(drivers =>
      drivers.partnerName.toLowerCase().includes(this.searchText.toLowerCase()) ||
      drivers.companyMobileNo.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  onBack() {
    this.driverForm.reset();
    this.bpNumber = '';
    this.onLoadDriverList();
  }

  onNavigateHome() {
    this.router.navigate(['/home']);
  }
}


