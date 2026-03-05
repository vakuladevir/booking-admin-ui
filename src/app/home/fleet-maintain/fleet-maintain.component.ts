
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FleetMaintenanceVO } from 'src/app/model/fleetMaintenanceVO.model';
import { GeneralRespVO } from 'src/app/model/generalRespVO.model';
import { FleetService } from 'src/app/services/fleet.service';
import { MessageDialogService } from 'src/app/services/message-dialog.service';
import { ParnterMasterService } from 'src/app/services/partnerMaster.service';
import { VehicleService } from 'src/app/services/vehicle.service';

@Component({
  selector: 'app-fleet-maintain',
  templateUrl: './fleet-maintain.component.html',
  styleUrls: ['./fleet-maintain.component.scss']
})

// Only one valid class definition below:

export class FleetMaintainComponent implements OnInit {
  // --- BP Number Autocomplete for Modal ---
  bpNumberInput: string = '';
  filteredBPNumbersArr: string[] = [];
  isBPNumberDropdownOpen: boolean = false;

  // --- BP Code Autocomplete for Form ---
  isBpDropdownOpen: boolean = false;
  bpNumber: string = '';
  filteredBpNumbersArr: string[] = [];

  isShow: boolean = false;
  isCreate: boolean = false;
  isUpdate: boolean = false;
  isDelete: boolean = false;
  isListView: boolean = false; 
  isView: boolean = false;
  isListViewByBP: boolean = false;
  isEdit: boolean = false;
  fleetForm!: FormGroup;
  fleetId!: any;
  bpNumbersArr: string[] = [];
  vehicleCode: string = '';
  vehicleCodeArr: string[] = [];
  vehicleCodeInput: string = '';
  filteredVehicleCodeArr: string[] = [];
  isVehicleCodeDropdownOpen: boolean = false;
  fleetObj: FleetMaintenanceVO = new FleetMaintenanceVO();
  fleetsByBP: any[] = [];
  fleets: any[] = [];
  filteredPartners: any[] = [];
  searchText: string = '';

  // Only keep one set of property declarations, one constructor, and one ngOnInit method.

  // --- BP Code Autocomplete Methods ---
  onBpNumberInput(event?: any) {
    // Keep bpNumber and bpCode in sync with input value
    if (event && event.target) {
      const input = event.target as HTMLInputElement;
      this.bpNumber = input.value;
      this.fleetForm.get('bpCode')?.setValue(this.bpNumber);
    } else {
      this.bpNumber = this.fleetForm.get('bpCode')?.value || '';
    }
    if (!this.bpNumber) {
      this.filteredBpNumbersArr = this.bpNumbersArr;
      this.isBpDropdownOpen = false;
      return;
    }
    const search = this.bpNumber.toLowerCase();
    this.filteredBpNumbersArr = this.bpNumbersArr.filter((bp: string) => bp.toLowerCase().includes(search));
    this.isBpDropdownOpen = this.filteredBpNumbersArr.length > 0;
  }

  selectBpNumber(bp: string) {
    // Set the BP Code in the input and form
    this.bpNumber = bp;
    this.fleetForm.get('bpCode')?.setValue(bp); // Set BP Code string
    this.filteredBpNumbersArr = [];
    this.isBpDropdownOpen = false;
    // Fetch partner details and set partnerId and partnerName
    this.partnerService.getPartnerByBpNo(bp).subscribe((data) => {
      if (data) {
        this.fleetForm.get('partnerName')?.setValue(data.partnerName);
        this.fleetForm.get('partnerId')?.setValue(data.partnerId); // Numeric ID
      } else {
        this.fleetForm.get('partnerName')?.setValue('');
        this.fleetForm.get('partnerId')?.setValue('');
        alert('No partner found with this BP Number!');
      }
    });
  }

  closeBpDropdown() {
    this.fleetForm?.get('partnerId')?.markAsTouched();
    setTimeout(() => { this.isBpDropdownOpen = false; }, 200);
  }


  constructor(private formBuilder: FormBuilder,
    private messageDialog: MessageDialogService,
    private vehicleService: VehicleService,
    private fleetService: FleetService,
    private partnerService: ParnterMasterService,
    private router: Router) {
  }

  onVehicleCodeInput() {
    if (!this.vehicleCodeInput) {
      this.filteredVehicleCodeArr = this.vehicleCodeArr;
      this.isVehicleCodeDropdownOpen = false;
      return;
    }
    const search = this.vehicleCodeInput.toLowerCase();
    this.filteredVehicleCodeArr = this.vehicleCodeArr.filter((code: string) => code.toLowerCase().includes(search));
    this.isVehicleCodeDropdownOpen = this.filteredVehicleCodeArr.length > 0;
  }

  selectVehicleCode(code: string) {
    this.vehicleCodeInput = code;
    this.vehicleCode = code;
    this.filteredVehicleCodeArr = [];
    this.isVehicleCodeDropdownOpen = false;
    // Optionally, fetch vehicle details as in onSelectVehicleType
    this.onSelectVehicleType({ target: { value: code } } as any);
  }

  closeVehicleCodeDropdown() {
    setTimeout(() => { this.isVehicleCodeDropdownOpen = false; }, 200);
  }

  ngOnInit(): void {
    // this.vehicleService.getAllVehicleCodes().subscribe((data) => {
    //   this.vehicleCodeArr = data;
    // });
    // this.fleetService.getAllFleet().subscribe((data) => {
    //   this.fleetCode = data;
    // });
    this.vehicleService.getAllVehicleCodes().subscribe((vehicleData) => {
      this.fleetService.getAllFleet().subscribe((fleetData) => {
        const fleetVehicleCodes = fleetData.map((f: { vehicleCode: any; }) => f.vehicleCode); // extract codes from objects
        this.vehicleCodeArr = vehicleData.filter(
          (code: any) => !fleetVehicleCodes.includes(code)
        );
        this.onVehicleCodeInput(); // update filtered list after fetching
      });
    });
    this.partnerService.getAllBpNo().subscribe((data) => {
      this.bpNumbersArr = data;
      this.filteredBPNumbersArr = data;
    });
  }

  onBPNumberInput() {
    if (!this.bpNumberInput) {
      this.filteredBPNumbersArr = this.bpNumbersArr;
      this.isBPNumberDropdownOpen = false;
      return;
    }
    const search = this.bpNumberInput.toLowerCase();
    this.filteredBPNumbersArr = this.bpNumbersArr.filter((code: string) => code.toLowerCase().includes(search));
    this.isBPNumberDropdownOpen = this.filteredBPNumbersArr.length > 0;
  }

  selectBPNumber(code: string) {
    this.bpNumberInput = code;
    this.bpNumber = code;
    this.filteredBPNumbersArr = [];
    this.isBPNumberDropdownOpen = false;
  }

  closeBPNumberDropdown() {
    setTimeout(() => { this.isBPNumberDropdownOpen = false; }, 200);
  }

  initializeForm() {
    this.fleetForm = this.formBuilder.group({
      vehicleId: [''],
      vehicleCode: [''], 
      partnerId: [''],
      vehicleType: [{ value: '', disabled: true }],
      bpCode: [{ value: '', disabled: true }],
      partnerName: [{ value: '', disabled: true }],
      lastServiceDate: ['', Validators.required],
      serviceDueOn: ['', Validators.required],
      serviceAgentName: ['', Validators.required],
      serviceAgentPhoneNumber: ['', [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
      insuranceStatus: ['', Validators.required],
      insuranceExpiryDate: ['', Validators.required],
      vehicleCondition: ['', Validators.required],
      approverName: ['', Validators.required],
      isApproved: [false],
    });
  }

  onLoadCreate() {
    this.isShow = true;
    this.isCreate = true;
    this.isUpdate = false;
    this.isDelete = false;
    this.isListView = false;
    this.isListViewByBP = false;
    this.initializeForm();
    this.isEdit = true;
    this.vehicleCode = '';
    this.vehicleCodeInput = '';
    this.onVehicleCodeInput();
  }

  onCreate() {

    // Enable disabled fields before getting value
    this.fleetForm.get('vehicleType')?.enable({ emitEvent: false });
    this.fleetForm.get('bpCode')?.enable({ emitEvent: false });
    this.fleetForm.get('partnerName')?.enable({ emitEvent: false });
    if (this.fleetForm.valid) {
      this.fleetObj = Object.assign({}, this.fleetForm.value);
      // Re-disable fields after getting value
      this.fleetForm.get('vehicleType')?.disable({ emitEvent: false });
      this.fleetForm.get('bpCode')?.disable({ emitEvent: false });
      this.fleetForm.get('partnerName')?.disable({ emitEvent: false });
      this.fleetService.createFleet(this.fleetObj)
        .subscribe(
          (resp: GeneralRespVO) => {
            if (resp.message === "Success") {
              let message = 'Fleet Creation Successfull!! ' + resp.subMessage;
              this.messageDialog.openDialog('Info', message, 'Ok');
              this.fleetForm.reset();
              this.vehicleCode = '';
            } else {
              this.messageDialog.openDialog('Error', 'Please verify your info', 'Close');
              this.fleetForm.reset();
              this.vehicleCode = '';
            }

          })
    } else {
      // Re-disable fields if invalid
      this.fleetForm.get('vehicleType')?.disable({ emitEvent: false });
      this.fleetForm.get('bpCode')?.disable({ emitEvent: false });
      this.fleetForm.get('partnerName')?.disable({ emitEvent: false });
      this.messageDialog.openDialog('Error', 'Please fill out all the fields', 'Close');
      this.fleetForm.markAllAsTouched();
    }
  }


  // onSelectBP(event: Event): void {

  //   const selectedBP = (event.target as HTMLSelectElement).value;;
  //   this.bpNumber = selectedBP;
  //   this.partnerService.getPartnerByBpNo(selectedBP).subscribe((data) => {
  //     if (data) {
  //       this.fleetForm.get('partnerName')?.setValue(data.partnerName);
  //       this.fleetForm.get('partnerId')?.setValue(data.partnerId);
  //       this.fleetForm.get('bpCode')?.setValue(data.bpNo);
  //     } else {
  //       alert('No partner found with this BP Number!');
  //     }
  //   });
  // }

  onSelectVehicleType(event: Event): void {

    const selectedVC = (event.target as HTMLSelectElement).value;;
    this.vehicleCode = selectedVC;
    this.vehicleService.getVehicleByCode(selectedVC).subscribe((data) => {
      if (data) {
        this.fleetForm.get('vehicleType')?.setValue(data.vehicleType);
        this.fleetForm.get('vehicleId')?.setValue(data.vehicleId);
        this.fleetForm.get('vehicleCode')?.setValue(data.vehicleCode);
        this.fleetForm.get('partnerName')?.setValue(data.partnerName);
        this.fleetForm.get('partnerId')?.setValue(data.partnerId);
        this.fleetForm.get('bpCode')?.setValue(data.bpCode);
      } else {
        alert('No vehicle found with this code!');
      }
    });
  }

  onSearchFleetsByBPNo() {
    this.isShow = false;
    this.isCreate = false;
    this.isUpdate = false;
    this.isDelete = false;
    this.isView = false;
    this.isListView = false;
    this.isListViewByBP = true;
    this.isEdit = false;
    this.fleetService.getAllFleetByBPNo(this.bpNumber).subscribe((data) => {
        this.fleetsByBP = data;
    });
  }

  onEdit(fleetId: number) {
    this.isCreate = false;
    this.isUpdate = true;
    this.isDelete = true;
    this.isListView = false;
    this.isView = true;
    this.isListViewByBP = false;
    this.isEdit = false;
    this.initializeForm();
    this.fleetService.getFleetById(fleetId).subscribe((data) => {
      if (data) {
        this.fleetForm.patchValue(data);
        this.vehicleCode = data.vehicleCode;
        this.vehicleCodeInput = data.vehicleCode;
        this.onVehicleCodeInput();
        this.fleetId = data.fleetId;
        this.isShow = true; // Show form with details
      }
    });
  }


  onUpdate() {
    if (this.fleetForm.valid) {
      this.fleetObj = Object.assign({}, this.fleetForm.value);
      this.fleetService.updateFleet(this.fleetId, this.fleetObj)
        .subscribe(
          (resp: GeneralRespVO) => {
            if (resp.message === "Success") {
              let message = 'Fleet Updation Successfull!! ' + resp.subMessage;
              this.messageDialog.openDialog('Info', message, 'Ok');
            } else {
              this.messageDialog.openDialog('Error', 'Please verify your info', 'Close');
              this.fleetId = '';
              this.fleetForm.reset();
            }

          })
    } else {
      this.messageDialog.openDialog('Error', 'Please fill out all the fields', 'Close');
      this.fleetForm.markAllAsTouched();
    }
  }

  onDelete() {
    this.fleetService.deleteFleet(this.fleetId)
      .subscribe(
        (resp: string) => {
          this.messageDialog.openDialog('Info', resp, 'Ok');
          this.fleetForm.reset();
          this.fleetId = '';
        })
  }

  onLoadFleetList() {
    this.isListView = true; // Show table
    this.isCreate = false;
    this.isDelete = false;
    this.isUpdate = false;
    this.isShow = false;
    this.isView = false;
    this.isListViewByBP = false;
    this.isEdit = false;

    this.fleetService.getAllFleet().subscribe((data) => {
      this.fleets = data;
      this.filteredPartners = data; // Initialize filtered data
      
    });
  }


  onView(fleetId: number) {
    this.isCreate = false;
    this.isUpdate = false;
    this.isDelete = false;
    this.isListView = false;
    this.isView = true;
    this.isListViewByBP = false;
    this.isEdit = false;
    this.initializeForm();
    this.fleetService.getFleetById(fleetId).subscribe((data) => {
      if (data) {
        this.fleetForm.patchValue(data);
        this.vehicleCode = data.vehicleCode;
        this.vehicleCodeInput = data.vehicleCode;
        this.onVehicleCodeInput();
        this.fleetId = data.fleetId;
        this.isShow = true; // Show form with details
      }
    });
  }

  onSearchChange() {
    this.filteredPartners = this.fleets.filter(fleets =>
      fleets.partnerName.toLowerCase().includes(this.searchText.toLowerCase()) ||
      fleets.vehicleCondition.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  onBack() {
    this.fleetForm.reset();
    this.fleetId = '';
    this.onLoadFleetList();
  }

  onNavigateHome() {
    this.router.navigate(['/home']);
  }
}


