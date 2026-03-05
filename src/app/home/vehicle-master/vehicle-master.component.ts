
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GeneralRespVO } from 'src/app/model/generalRespVO.model';
import { VehicleDetailsVO } from 'src/app/model/vehicleDetailsVO.model';
import { MessageDialogService } from 'src/app/services/message-dialog.service';
import { ParnterMasterService } from 'src/app/services/partnerMaster.service';
import { VehicleService } from 'src/app/services/vehicle.service';

@Component({
  selector: 'app-vehicle-master',
  templateUrl: './vehicle-master.component.html',
  styleUrls: ['./vehicle-master.component.scss']
})
export class VehicleMasterComponent implements OnInit {
  
  isShow: boolean = false;
  isCreate: boolean = false;
  isUpdate: boolean = false;
  isDelete: boolean = false;
  isListView: boolean = false;
  isView: boolean = false;
  isEdit: boolean = false;
  vehicleForm!: FormGroup;
  bpNumber: string = '';
  bpNumbersArr: string[] = [];
  filteredBpNumbersArr: string[] = [];
  vTypeName: string = '';
  vTypeNameArr: string[] = [];
  vehicleObj: VehicleDetailsVO = new VehicleDetailsVO();
  vCode: string = '';
  vCodeArr: string[] = [];

   vCodeInput: string = '';
  filteredVCodeArr: string[] = [];
  isVCodeDropdownOpen: boolean = false;

  hoveredBp: string | null = null;

  vehicle: any[] = [];  // Store fetched partners
  filteredPartners: any[] = []; // Store search results
  searchText: string = ''; // Bind search input

  constructor(private formBuilder: FormBuilder,
    private messageDialog: MessageDialogService,
    private partnerService: ParnterMasterService,
    private router: Router,
    private vehicleService: VehicleService) { }
  isBpDropdownOpen: boolean = false;

  ngOnInit(): void {
    this.vehicleService.getAllVehicleCodes().subscribe((data) => {
      this.vCodeArr = data;
    });
  }

  initializeForm() {
    this.vehicleForm = this.formBuilder.group({
      vtypeId: ['', Validators.required],
      model: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9\- ]{2,30}$/)]],
      seatingCapacity: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      licensePlateNo: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/)]],
      rcNumber: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{6,20}$/)]],
      insuranceNo: ['', [Validators.required, Validators.pattern(/^[A-Z0-9\-]{6,20}$/)]],
      pucNo: ['', [Validators.required, Validators.pattern(/^[A-Z0-9\-]{6,20}$/)]],
      isDocumentsSubmitted: [false],
      partnerId: ['', Validators.required], // Numeric partner ID
      bpCode: ['', Validators.required], // Add BP Code field for the string code
      partnerName: [{ value: '', disabled: true }],
      isApproved: [false],
      approverName: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]{3,30}$/)]]
    });

    this.partnerService.getAllBpNo().subscribe((data) => {
      this.bpNumbersArr = data;
      this.filteredBpNumbersArr = data;
    });
    this.vehicleService.getAllVtypeNames().subscribe((data) => {
      this.vTypeNameArr = data;
    });
  }

   

  onVCodeInput() {
    if (!this.vCodeInput) {
      this.filteredVCodeArr = this.vCodeArr;
      this.isVCodeDropdownOpen = false;
      return;
    }
    const search = this.vCodeInput.toLowerCase();
    this.filteredVCodeArr = this.vCodeArr.filter(code => code.toLowerCase().includes(search));
    this.isVCodeDropdownOpen = this.filteredVCodeArr.length > 0;
  }

  selectVCode(code: string) {
    this.vCodeInput = code;
    this.vCode = code;
    this.filteredVCodeArr = [];
    this.isVCodeDropdownOpen = false;
  }

  closeVCodeDropdown() {
    setTimeout(() => { this.isVCodeDropdownOpen = false; }, 200);
  }

  // (removed duplicate)
  onBpNumberInput(event?: any) {
    // Keep bpNumber and bpCode in sync with input value
    if (event && event.target) {
      this.bpNumber = event.target.value;
      this.vehicleForm.get('bpCode')?.setValue(this.bpNumber);
    } else {
      this.bpNumber = this.vehicleForm.get('bpCode')?.value || '';
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

  // ...existing code...
  closeBpDropdown() {
    this.vehicleForm?.get('partnerId')?.markAsTouched();
    setTimeout(() => { this.isBpDropdownOpen = false; }, 200);
  }

  // (removed duplicate)
  selectBpNumber(bp: string) {
    // Set the BP Code in the input and form
    this.bpNumber = bp;
    this.vehicleForm.get('bpCode')?.setValue(bp); // Set BP Code string
    this.filteredBpNumbersArr = [];
    this.isBpDropdownOpen = false;
    // Fetch partner details and set partnerId and partnerName
    this.partnerService.getPartnerByBpNo(bp).subscribe((data) => {
      if (data) {
        this.vehicleForm.get('partnerName')?.setValue(data.partnerName);
        this.vehicleForm.get('partnerId')?.setValue(data.partnerId); // Numeric ID
      } else {
        this.vehicleForm.get('partnerName')?.setValue('');
        this.vehicleForm.get('partnerId')?.setValue('');
        alert('No partner found with this BP Number!');
      }
    });
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
    this.vCode = '';
    this.vTypeName = '';
  }

  // search = (text$: Observable<string>) =>
  //   text$.pipe(
  //     debounceTime(300), // Wait for user to stop typing
  //     distinctUntilChanged(), // Ignore repeated searches
  //     map(term => term.length < 2 ? []
  //       : this.bpNumbersArr.filter(bp => bp.toLowerCase().includes(term.toLowerCase())).slice(0, 10)) // Filter BP Numbers
  //   );

  onSelectBP(event: Event): void {
    // Only update partner fields, do not overwrite bpNumber
    const selectedBP = (event.target as HTMLSelectElement).value;
    this.vehicleForm.get('bpCode')?.setValue(selectedBP); // Set BP Code string
    this.partnerService.getPartnerByBpNo(selectedBP).subscribe((data) => {
      if (data) {
        this.vehicleForm.get('partnerName')?.setValue(data.partnerName);
        this.vehicleForm.get('partnerId')?.setValue(data.partnerId);
      } else {
        this.vehicleForm.get('partnerName')?.setValue('');
        this.vehicleForm.get('partnerId')?.setValue('');
        alert('No partner found with this BP Number!');
      }
    });
  }

  // searchVehicle = (text$: Observable<string>) =>
  //   text$.pipe(
  //     debounceTime(300), // Wait for user to stop typing
  //     distinctUntilChanged(), // Ignore repeated searches
  //     map(term => term.length < 2 ? []
  //       : this.vTypeNameArr.filter(vt => vt.toLowerCase().includes(term.toLowerCase())).slice(0, 10)) // Filter BP Numbers
  // );


  onSelectVehicleType(event: Event): void {

    const selectedvType = (event.target as HTMLSelectElement).value;
    this.vTypeName = selectedvType;
    this.vehicleService.getByVTypeName(selectedvType).subscribe((data) => {
      if (data) {
        this.vehicleForm.get('vtypeId')?.setValue(data.vtypeId);
      } else {
        alert('No Such vehicle Type defined in the system!');
      }
    });
  }

  onCreate() {

    if (this.vehicleForm.valid) {
      this.vehicleObj = Object.assign({}, this.vehicleForm.value);
      this.vehicleService.createVehicle(this.vehicleObj)
        .subscribe(
          (resp: GeneralRespVO) => {
            if (resp.message === "Success") {
              let message = 'Vehicle Master Creation Successfull!! ' + resp.subMessage;
              this.messageDialog.openDialog('Info', message, 'Ok');
              this.vehicleForm.reset();
              this.bpNumber = '';
              this.vTypeName = '';
              this.vehicleService.getAllVehicleCodes().subscribe((data) => {
                this.vCodeArr = data;
              });
            } else {
              this.messageDialog.openDialog('Error', 'Please verify your info', 'Close');
              this.vehicleForm.reset();
              this.vehicleForm.markAllAsTouched();
              this.bpNumber = '';
              this.vTypeName = ''
            }

          })
    } else {
      this.messageDialog.openDialog('Error', 'Please fill out all the fields', 'Close');
      this.vehicleForm.markAllAsTouched();
    }
  }

  // searchVcode = (text$: Observable<string>) =>
  //   text$.pipe(
  //     map(term => term.length < 2 ? []
  //       : this.vCodeArr.filter(vCodee => vCodee.toLowerCase().includes(term.toLowerCase())).slice(0, 10)) // Filter BP Numbers
  // );

  // validateVehicleType() {
  //   if (!this.vTypeNameArr.includes(this.vTypeName)) {
  //     this.vTypeError = true; // Show error message
  //   } else {
  //     this.vTypeError = false; // Hide error if valid
  //   }
  // }

  onSearchVehicleCode() {
    this.isCreate = false;
    this.isUpdate = true;
    this.isDelete = true;
    this.isView = false;
    this.isListView = false;
    this.initializeForm();
    this.isEdit = false;

    if (!this.vCode) {
      alert('Please enter Vehicle Code!');
      return;
    }

    this.vehicleService.getVehicleByCode(this.vCode).subscribe((data) => {
      if (data) {
        this.vehicleForm.patchValue({ ...data, bpCode: data.bpCode });
        this.vTypeName = data.vehicleType;
        this.bpNumber = data.bpCode;
        this.vehicleForm.get('partnerName')?.setValue(data.partnerName);
        this.vehicleForm.get('partnerId')?.setValue(data.partnerId);
        this.isShow = true; // Show form with details
      } else {
        alert('No Vehicle found with this Vehicle Code!');
      }
    });
  }

  onUpdate() {
    if (this.vehicleForm.valid) {
      this.vehicleObj = Object.assign({}, this.vehicleForm.value);
      this.vehicleService.updateVehicle(this.vCode, this.vehicleObj)
        .subscribe(
          (resp: GeneralRespVO) => {
            if (resp.message === "Success") {
              let message = 'Vehicle Updation Successfull!! ' + resp.subMessage;
              this.messageDialog.openDialog('Info', message, 'Ok');
            } else {
              this.messageDialog.openDialog('Error', 'Please verify your info', 'Close');
              this.bpNumber = '';
              this.vTypeName = '';
              this.vCode = '';
              this.vehicleForm.reset();
            }

          })
    } else {
      this.messageDialog.openDialog('Error', 'Please fill out all the fields', 'Close');
      this.vehicleForm.markAllAsTouched();
    }
  }

  onDelete() {
    this.vehicleService.deleteVehicle(this.vCode)
    .subscribe(
      (resp: string) => {
        this.messageDialog.openDialog('Info', resp, 'Ok');
        this.bpNumber = '';
        this.vTypeName = '';
        this.vCode = '';
        this.vehicleForm.reset();
      })
  }

  onBack() {
    this.bpNumber = '';
    this.vTypeName = '';
    this.vCode = '';
    this.vehicleForm.reset();
    this.onLoadVehicleList();
  }

  onLoadVehicleList() {
    this.isListView = true; // Show table
    this.isCreate = false;
    this.isUpdate = false;
    this.isShow = false;
    this.isView = false;

    this.vehicleService.getAllVehicle().subscribe((data) => {
      this.vehicle = data;
      this.filteredPartners = data; // Initialize filtered data
      
    });
  }

  onView(vehicleCode: string) {
    this.vCode = vehicleCode;
    this.isCreate = false;
    this.isUpdate = false;
    this.isDelete = false;
    this.isListView = false;
    this.isView = true;
    this.initializeForm();

    this.vehicleService.getVehicleByCode(this.vCode).subscribe((data) => {
      if (data) {
        this.vehicleForm.patchValue({ ...data, bpCode: data.bpCode });
        this.vTypeName = data.vehicleType;
        this.bpNumber = data.bpCode;
        this.vehicleForm.get('partnerName')?.setValue(data.partnerName);
        this.vehicleForm.get('partnerId')?.setValue(data.partnerId);
        this.isShow = true; // Show form with details
      }
    });
  }

  onSearchChange() {
    this.filteredPartners = this.vehicle.filter(vehicle =>
      vehicle.vehicleCode.toLowerCase().includes(this.searchText.toLowerCase()) ||
      vehicle.vehicleType.toLowerCase().includes(this.searchText.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(this.searchText.toLowerCase()) ||
      vehicle.partnerName.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  onNavigateHome() {
    this.router.navigate(['/home']);
  }


}
