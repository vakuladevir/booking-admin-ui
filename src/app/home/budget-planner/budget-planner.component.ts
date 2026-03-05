import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BudgetPlannerVO } from 'src/app/model/budgetPlannerVO.model';
import { BudgetPlannerService } from 'src/app/services/budgetPlanner.service';
import { MessageDialogService } from 'src/app/services/message-dialog.service';
import { RouteMapService } from 'src/app/services/routeMap.service';
import { VehicleService } from 'src/app/services/vehicle.service';

@Component({
  selector: 'app-budget-planner',
  templateUrl: './budget-planner.component.html',
  styleUrls: ['./budget-planner.component.scss']
})
export class BudgetPlannerComponent implements OnInit {

  onEditSubmit(): void {
    const budgetId = this.editBudgetForm.get('budgetId')?.value;
    if (!budgetId) {
      this.messageDialog.openDialog('Error', 'Budget ID not available.', 'Close');
      return;
    }
    this.budgetService.getBudgetById(budgetId).subscribe({
      next: (budget: BudgetPlannerVO) => {
        if (budget) {
          this.selectedEditBudget = budget; // Set selectedEditBudget for update/delete
          this.budgetPlannerForm.patchValue(budget);
          // Explicitly patch BudgetGenId and Version in main form
          this.budgetPlannerForm.patchValue({
            budgetGenId: budget.budgetGenId ?? '',
            budgetVersion: budget.budgetVersion ?? ''
          });
          // Patch BudgetGenId and Version in editBudgetForm
          this.editBudgetForm.patchValue({
            budgetGenId: budget.budgetGenId ?? '',
            budgetVersion: budget.budgetVersion ?? '',
            budgetId: budget.budgetId ?? ''
          });
          this.isShow = true;
          this.isCreate = false;
          this.isUpdate = true;
          this.isDelete = true;
          this.isView = false;
          setTimeout(() => {
            const modal: any = document.getElementById('editBudgetModal');
            if (modal) {
              // Try to get the already opened modal instance
              let bsModal = (window as any).bootstrap.Modal.getInstance(modal);
              if (!bsModal) {
                bsModal = new (window as any).bootstrap.Modal(modal);
              }
              bsModal.hide();
              // Fallback: trigger native close button if modal remains
              const closeBtn = modal.querySelector('.btn-close');
              if (closeBtn) {
                (closeBtn as HTMLElement).click();
              }
            }
          }, 100);
        } else {
          this.messageDialog.openDialog('Error', 'No budget found for this ID.', 'Close');
        }
      },
      error: () => {
        this.messageDialog.openDialog('Error', 'Failed to fetch budget.', 'Close');
      }
    });
  }
  selectedListBudgetGenId: string = '';
  onListBudgets(): void {
    this.isCreate = false;
    this.isUpdate = false;
    this.isDelete = false;
    this.isView = true;
    // Fetch all unique BudgetGenIds for dropdown
    this.budgetService.getAllUniqueBudgetGenIds().subscribe((ids: string[]) => {
      this.uniqueBudgetGenIds = ids;
      this.selectedListBudgetGenId = '';
      this.listBudgetVersionList = [];
      // Show modal
      const modal: any = document.getElementById('listBudgetModal');
      if (modal) {
        const bsModal = new (window as any).bootstrap.Modal(modal);
        bsModal.show();
      }
    });
  }

  onListBudgetGenIdChange(): void {
    if (!this.selectedListBudgetGenId) {
      this.listBudgetVersionList = [];
      return;
    }
    this.budgetService.getAllVersionsByBudgetGenId(this.selectedListBudgetGenId).subscribe({
      next: (data: BudgetPlannerVO[]) => {
        this.listBudgetVersionList = data || [];
        this.isListView = true;
        // Close the modal on success
        setTimeout(() => {
          const modal: any = document.getElementById('listBudgetModal');
          if (modal) {
            let bsModal = (window as any).bootstrap.Modal.getInstance(modal);
            if (!bsModal) {
              bsModal = new (window as any).bootstrap.Modal(modal);
            }
            bsModal.hide();
            // Fallback: trigger native close button if modal remains
            const closeBtn = modal.querySelector('.btn-close');
            if (closeBtn) {
              (closeBtn as HTMLElement).click();
            }
          }
        }, 100);
      },
      error: () => {
        this.listBudgetVersionList = [];
        // Message removed as requested
      }
    });
  }

  editBudgetForm!: FormGroup;
  uniqueBudgetGenIds: string[] = [];
  editVersionList: { version: number | undefined, budgetId: number | undefined }[] = [];
  selectedEditBudget: BudgetPlannerVO | null = null;
  listBudgetVersionList: BudgetPlannerVO[] = [];

  isShow: boolean = false;
  budgetPlannerForm!: FormGroup;
  vTypeNameArr: string[] = [];
  routeMapCodeArr1: string[] = [];
  routeMapCodeArr2: string[] = [];
  isCreate: boolean = false;
  isUpdate: boolean = false;
  isDelete: boolean = false;
  isView: boolean = false;
  isListView: boolean = false;
  // versionList: BudgetPlannerVO[] = [];
  // selectedVersion: number = 1;


  constructor(private formBuilder: FormBuilder,
    private messageDialog: MessageDialogService,
    private budgetService: BudgetPlannerService,
    private vehicleService: VehicleService,
    private routeMapService: RouteMapService,
    private router: Router) { }

  ngOnInit(): void {
    this.initializeForm();
    this.attachFormListeners();
    // Initialize edit form
    this.editBudgetForm = this.formBuilder.group({
      budgetGenId: [''],
      budgetVersion: [''],
      budgetId: ['']
    });
    // Listen for version changes to update budgetId
    this.editBudgetForm.get('budgetVersion')?.valueChanges.subscribe(() => {
      this.onEditVersionChange();
    });
  }
  openEditModal(): void {
    this.budgetService.getAllUniqueBudgetGenIds().subscribe((ids: string[]) => {
      this.uniqueBudgetGenIds = ids;
      this.editBudgetForm.patchValue({ budgetGenId: '', budgetVersion: '' });
      this.editVersionList = [];
      this.selectedEditBudget = null;
      this.isCreate = false;
      this.isUpdate = true;
      this.isDelete = true;
      this.isView = false;
      // Show modal
      const modal: any = document.getElementById('editBudgetModal');
      if (modal) {
        const bsModal = new (window as any).bootstrap.Modal(modal);
        bsModal.show();
      }
    });
  }

  onEditBudgetGenIdChange(): void {
    const budgetGenId = this.editBudgetForm.get('budgetGenId')?.value;
    if (budgetGenId) {
      this.budgetService.getAllVersionsByBudgetGenId(budgetGenId).subscribe((versions: BudgetPlannerVO[]) => {
        // Store version and budgetId mapping
        this.editVersionList = versions.map(v => ({ version: v.budgetVersion, budgetId: v.budgetId }));
        this.editBudgetForm.patchValue({ budgetVersion: '' });
        this.editBudgetForm.patchValue({ budgetId: '' });
        this.selectedEditBudget = null;
      });
    } else {
      this.editVersionList = [];
      this.editBudgetForm.patchValue({ budgetVersion: '' });
      this.editBudgetForm.patchValue({ budgetId: '' });
    }
  }

  onEditVersionChange(): void {
    const budgetGenId = this.editBudgetForm.get('budgetGenId')?.value;
    let budgetVersion = this.editBudgetForm.get('budgetVersion')?.value;
    if (budgetGenId && budgetVersion) {
      // Ensure budgetVersion is a number for comparison
      budgetVersion = typeof budgetVersion === 'string' ? Number(budgetVersion) : budgetVersion;
      const versionObj = this.editVersionList.find(v => v.version === budgetVersion);
      if (versionObj && versionObj.budgetId) {
        this.editBudgetForm.patchValue({ budgetId: versionObj.budgetId });
      } else {
        this.editBudgetForm.patchValue({ budgetId: '' });
      }
    }
  }

  onEditUpdate(): void {
    if (this.selectedEditBudget && typeof this.selectedEditBudget.budgetId === 'number') {
      const updatedData = this.budgetPlannerForm.getRawValue();
      this.budgetService.updateBudget(this.selectedEditBudget.budgetId, updatedData).subscribe({
        next: () => {
          this.messageDialog.openDialog('Success', 'Budget updated successfully.', 'Close');
        },
        error: () => {
          this.messageDialog.openDialog('Error', 'Failed to update budget.', 'Close');
        }
      });
    } else {
      this.messageDialog.openDialog('Error', 'Invalid budget ID for update.', 'Close');
    }
  }

  onEditDelete(): void {
    if (this.selectedEditBudget && typeof this.selectedEditBudget.budgetId === 'number') {
      this.budgetService.deleteBudget(this.selectedEditBudget.budgetId).subscribe({
        next: () => {
          this.messageDialog.openDialog('Success', 'Budget deleted successfully.', 'Close');
          this.isShow = false;
        },
        error: () => {
          this.messageDialog.openDialog('Error', 'Failed to delete budget.', 'Close');
        }
      });
    } else {
      this.messageDialog.openDialog('Error', 'Invalid budget ID for delete.', 'Close');
    }
  }


  initializeForm() {
    this.budgetPlannerForm = this.formBuilder.group({
      budgetType: ['', Validators.required],
      budgetGenId: [''],
      budgetVersion: [''],
      vtypeId: ['', Validators.required],
      vtypeName: ['', Validators.required],
      routeMapCode1: ['', Validators.required],
      routeMapCode2: [{ value: '', disabled: true }],
      totalKm: [{ value: '', disabled: true }, Validators.required],
      mileage: [{ value: '', disabled: true }, , Validators.required],
      fuelType: [{ value: '', disabled: true }, Validators.required],
      fuelRequired: [{ value: '', disabled: true }, , Validators.required],
      fuelPrice: ['', Validators.required],
      fuelPriceDate: ['', Validators.required],
      fuelCharge: [{ value: '', disabled: true }, Validators.required],
      tollCharge: ['', Validators.required],
      tollCount: [{ value: '', disabled: true }, Validators.required],
      permitCharge: ['', Validators.required],
      driverBeta: ['', Validators.required],
      otherCharge: [''],
      tripTotalExpense: [{ value: '', disabled: true }, Validators.required],
      markupPercent: ['', Validators.required],
      markupAmount: [{ value: '', disabled: true }, Validators.required],
      tripCost: [{ value: '', disabled: true }, Validators.required],
      noOfSeats: [{ value: '', disabled: true }, Validators.required],
      costPerSeat: [{ value: '', disabled: true }, Validators.required],
      isActive: ['']
    });

    this.budgetPlannerForm.get('budgetType')?.valueChanges.subscribe(value => {
      if (value === 'Round Trip') {
        this.resetTripFields();
        this.budgetPlannerForm.get('routeMapCode2')?.enable();
        this.budgetPlannerForm.get('routeMapCode2')?.setValidators([Validators.required]);
      } else {
        this.resetTripFields();
        this.budgetPlannerForm.get('routeMapCode2')?.reset();
        this.budgetPlannerForm.get('routeMapCode2')?.disable();
        this.budgetPlannerForm.get('routeMapCode2')?.clearValidators();
      }
      this.budgetPlannerForm.get('routeMapCode2')?.updateValueAndValidity();
    });


    this.vehicleService.getAllVtypeNames().subscribe((data) => {
      this.vTypeNameArr = data;
    });

    this.routeMapService.getAllRouteCode().subscribe((data) => {
      this.routeMapCodeArr1 = data;
      this.routeMapCodeArr2 = data;
    });

  }

  get f() {
    return this.budgetPlannerForm.controls;
  }


  onCreateBudgetPlanner() {
    this.isShow = true;
    this.isCreate = true;
    this.isUpdate = false;
    this.isDelete = false;
    this.isView = false;
    this.budgetPlannerForm.reset(); // Only reset, do not re-initialize
    // Do NOT call initializeForm or attachFormListeners here
  }

  onSelectVehicleType(event: Event): void {

    const selectedvType = (event.target as HTMLSelectElement).value;
    this.vehicleService.getByVTypeName(selectedvType).subscribe((data) => {
      if (data) {
        this.budgetPlannerForm.get('vtypeId')?.setValue(data.vtypeId);
        this.budgetPlannerForm.get('mileage')?.setValue(data.mileage);
        this.budgetPlannerForm.get('fuelType')?.setValue(data.fuelType);
        this.budgetPlannerForm.get('noOfSeats')?.setValue(data.noOfSeats);
      }
    });
  }

  onSelectedRouteMapCode(event: Event): void {
    const selectedCode = (event.target as HTMLSelectElement).value;
    const budgetType = this.budgetPlannerForm.value.budgetType;

    if (!selectedCode || !budgetType) return;

    this.routeMapService.getRouteByCode(selectedCode).subscribe((data) => {
      if (data) {
        if (budgetType === 'One Way') {
          // Direct values
          this.budgetPlannerForm.patchValue({
            totalKm: data.distanceKm,
            tollCount: data.tollCount,
            driverBeta: data.driverBeta,
          });
          this.autoCalculateFields();
        } else if (budgetType === 'Round Trip') {
          // Generate reverse code
          const reverseCode = selectedCode.split('-').reverse().join('-');
          if (this.routeMapCodeArr2.includes(reverseCode)) {
            this.budgetPlannerForm.get('routeMapCode2')?.setValue(reverseCode);
            // Multiply values for round trip
            this.budgetPlannerForm.patchValue({
              totalKm: (data?.distanceKm ?? 0) * 2,
              tollCount: (data?.tollCount ?? 0) * 2,
              driverBeta: (data?.driverBeta ?? 0) * 2,
              routeMapCode2: reverseCode
            });
            this.autoCalculateFields();
            // Force updateBudgetGenId after routeMapCode2 is set
            setTimeout(() => this.updateBudgetGenId(), 0);
          } else {
            this.messageDialog.openDialog('Error', 'RouteMap Code not available: ' + reverseCode, 'Close');
            this.budgetPlannerForm.get('budgetType')?.setValue('One Way');
            this.budgetPlannerForm.get('routeMapCode2')?.reset();
            this.budgetPlannerForm.get('routeMapCode2')?.disable();
            this.budgetPlannerForm.get('routeMapCode2')?.clearValidators();
          }
        }
      }
    });
  }

  resetTripFields() {
    // Clear validators and async validators before patching
    Object.keys(this.budgetPlannerForm.controls).forEach(key => {
      const control = this.budgetPlannerForm.get(key);
      if (control) {
        control.clearValidators();
        control.clearAsyncValidators();
        // Prevent recursion: onlySelf and emitEvent false
        control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      }
    });
    this.budgetPlannerForm.patchValue({
      budgetGenId: '',
      budgetVersion: '',
      vtypeId: '',
      vtypeName: '',
      routeMapCode1: '',
      routeMapCode2: '',
      totalKm: '',
      mileage: '',
      fuelRequired: '',
      fuelPrice: '',
      fuelPriceDate: '',
      fuelCharge: '',
      tollCharge: '',
      tollCount: '',
      permitCharge: '',
      driverBeta: '',
      otherCharge: '',
      tripTotalExpense: '',
      markupPercent: '',
      markupAmount: '',
      tripCost: '',
      noOfSeats: '',
      costPerSeat: '',
      isActive: ''
    }, { emitEvent: false });
  }

  attachFormListeners() {
    this.budgetPlannerForm.get('fuelRequired')?.valueChanges.subscribe(() => {
      // Prevent recursion: only update if needed
      const fuelRequired = this.budgetPlannerForm.get('fuelRequired')?.value;
      const fuelPrice = this.budgetPlannerForm.get('fuelPrice')?.value;
      const currentFuelCharge = this.budgetPlannerForm.get('fuelCharge')?.value;
      if (fuelRequired > 0 && fuelPrice > 0) {
        const newFuelCharge = +(fuelRequired * fuelPrice).toFixed(2);
        if (currentFuelCharge !== newFuelCharge) {
          this.budgetPlannerForm.patchValue({ fuelCharge: newFuelCharge }, { emitEvent: false });
        }
      }
    });

    this.budgetPlannerForm.get('fuelPrice')?.valueChanges.subscribe(() => {
      // Prevent recursion: only update if needed
      const fuelRequired = this.budgetPlannerForm.get('fuelRequired')?.value;
      const fuelPrice = this.budgetPlannerForm.get('fuelPrice')?.value;
      const currentFuelCharge = this.budgetPlannerForm.get('fuelCharge')?.value;
      if (fuelRequired > 0 && fuelPrice > 0) {
        const newFuelCharge = +(fuelRequired * fuelPrice).toFixed(2);
        if (currentFuelCharge !== newFuelCharge) {
          this.budgetPlannerForm.patchValue({ fuelCharge: newFuelCharge }, { emitEvent: false });
        }
      }
    });

    ['fuelCharge', 'tollCharge', 'permitCharge', 'driverBeta', 'otherCharge'].forEach(field => {
      this.budgetPlannerForm.get(field)?.valueChanges.subscribe(() => {
        this.updateTripTotalExpense();
      });
    });

    ['tripTotalExpense', 'markupPercent'].forEach(field => {
      this.budgetPlannerForm.get(field)?.valueChanges.subscribe(() => {
        this.updateMarkupAmount();
      });
    });

    ['markupPercent', 'markupAmount'].forEach(field => {
      this.budgetPlannerForm.get(field)?.valueChanges.subscribe(() => {
        this.updateTripCost();
      });
    });

    ['tripCost', 'noOfSeats', 'budgetType'].forEach(field => {
      this.budgetPlannerForm.get(field)?.valueChanges.subscribe(() => {
        this.updateCostPerSeat();
      });
    });
  }


  // loadVersionData(): void {
  //   const budgetGenId = this.budgetPlannerForm.get('budgetGenId')?.value;
  //   if (!budgetGenId) {
  //     this.messageDialog.openDialog('Error', 'Budget Generation ID is required to load versions.', 'Close');
  //     return;
  //   }
  //   this.budgetService.getVersionsByBudgetGenId(budgetGenId).subscribe({
  //     next: (versions: BudgetPlannerVO[]) => {
  //       this.versionList = versions;
  //       if (versions && versions.length > 0) {
  //         this.selectedVersion = versions[0].budgetVersion ?? 1;
  //       }
  //     },
  //     error: (err: any) => {
  //       this.messageDialog.openDialog('Error', 'Failed to load version data.', 'Close');
  //       console.error(err);
  //     }
  //   });
  // }

  autoCalculateFields() {
    const totalKm = this.budgetPlannerForm.get('totalKm')?.value;
    const mileage = this.budgetPlannerForm.get('mileage')?.value;

    if (totalKm && mileage) {
      const fuelRequired = totalKm / mileage;
      this.budgetPlannerForm.patchValue({
        fuelRequired: +fuelRequired.toFixed(2)  // round to 2 decimals
      });
    }
  }

  updateFuelCharge() {
    const fuelRequired = this.budgetPlannerForm.get('fuelRequired')?.value;
    const fuelPrice = this.budgetPlannerForm.get('fuelPrice')?.value;

    if (fuelRequired > 0 && fuelPrice > 0) {
      const fuelCharge = fuelRequired * fuelPrice;
      this.budgetPlannerForm.patchValue({
        fuelCharge: +fuelCharge.toFixed(2)
      }, { emitEvent: false });
    }
  }

  updateTripTotalExpense() {
    const fuelCharge = +this.budgetPlannerForm.get('fuelCharge')?.value || 0;
    const tollCharge = +this.budgetPlannerForm.get('tollCharge')?.value || 0;
    const permitCharge = +this.budgetPlannerForm.get('permitCharge')?.value || 0;
    const driverBeta = +this.budgetPlannerForm.get('driverBeta')?.value || 0;
    const otherCharge = +this.budgetPlannerForm.get('otherCharge')?.value || 0;

    const totalExpense = fuelCharge + tollCharge + permitCharge + driverBeta + otherCharge;

    this.budgetPlannerForm.patchValue({
      tripTotalExpense: +totalExpense.toFixed(2)
    }, { emitEvent: false });

    // Ensure downstream calculations run (markup -> trip cost -> cost per seat)
    this.updateMarkupAmount();
    this.updateTripCost();
    this.updateCostPerSeat();
  }

  updateMarkupAmount() {
    const totalExpense = +this.budgetPlannerForm.get('tripTotalExpense')?.value || 0;
    const markupPercent = +this.budgetPlannerForm.get('markupPercent')?.value || 0;

    const markupAmount = (totalExpense * markupPercent) / 100;

    this.budgetPlannerForm.patchValue({
      markupAmount: +markupAmount.toFixed(2)
    }, { emitEvent: false });

    // Recompute trip cost because markup changed
    this.updateTripCost();
  }

  updateTripCost() {
    const totalExpense = +this.budgetPlannerForm.get('tripTotalExpense')?.value || 0;
    const markupAmount = +this.budgetPlannerForm.get('markupAmount')?.value || 0;

    const tripCost = totalExpense + markupAmount;

    this.budgetPlannerForm.patchValue({
      tripCost: +tripCost.toFixed(2)
    }, { emitEvent: false });

    // Recompute cost per seat because trip cost changed
    this.updateCostPerSeat();
  }
  updateCostPerSeat() {
    const tripCost = +this.budgetPlannerForm.get('tripCost')?.value || 0;
    const noOfSeats = +this.budgetPlannerForm.get('noOfSeats')?.value || 1;
    const budgetType = this.budgetPlannerForm.get('budgetType')?.value;

    if (noOfSeats > 0) {
      // For Round Trip, multiply seats by 2 for cost calculation
      const effectiveSeats = budgetType === 'Round Trip' ? noOfSeats * 2 : noOfSeats;
      const costPerSeat = tripCost / effectiveSeats;
      this.budgetPlannerForm.patchValue({
        costPerSeat: +costPerSeat.toFixed(2)
      }, { emitEvent: false });
    }
  }

  updateBudgetGenId() {
    const { budgetType, vtypeName, routeMapCode1, routeMapCode2 } = this.budgetPlannerForm.value;
    if (budgetType && vtypeName && routeMapCode1) {
      let id = `${budgetType}_${vtypeName}_${routeMapCode1}`;
      if (budgetType === 'Round Trip' && routeMapCode2) {
        id += `_${routeMapCode2}`;
      }
      this.budgetPlannerForm.patchValue({ budgetGenId: id });

      // Call backend to get latest version and assign to budgetVersion
      this.budgetService.getLatestVersionByBudgetGenId(id).subscribe({
        next: (latest: BudgetPlannerVO) => {
          const nextVersion = (latest?.budgetVersion ?? 0) + 1;
          this.budgetPlannerForm.patchValue({ budgetVersion: nextVersion });
        },
        error: () => {
          this.budgetPlannerForm.patchValue({ budgetVersion: 1 });
        }
      });
    }
  }


  onSubmit(): void {
    if (this.budgetPlannerForm.invalid) {
      this.messageDialog.openDialog('Validation Failed', 'Please fill all required fields.', 'Close');
      return;
    }

    const formData = this.budgetPlannerForm.getRawValue(); // include disabled fields

    this.budgetService.createBudget(formData).subscribe({
      next: (resp) => {
        if (resp.message === 'Success') {
          this.messageDialog.openDialog('Success', resp.subMessage, 'Close');
          this.budgetPlannerForm.reset();
          this.isShow = false;
        } else {
          this.messageDialog.openDialog('Info', resp.message, 'Close');
        }
      },
      error: (err) => {
        this.messageDialog.openDialog('Error', 'Something went wrong while saving budget.', 'Close');
        console.error(err);
      }
    });
  }


  onNavigateHome() {
    this.router.navigate(['/home']);
  }

  onBack(): void {
    this.isShow = false;
    this.isCreate = false;
    this.isUpdate = false;
    this.isDelete = false;
    this.isView = false;
    this.budgetPlannerForm.reset();
    // Enable all controls for next use
    Object.keys(this.budgetPlannerForm.controls).forEach(key => {
      this.budgetPlannerForm.get(key)?.enable();
    });
    // Do NOT re-attach listeners here to avoid stack overflow
  }

  // Utility to check if form is in Edit mode
  isFormEditMode(): boolean {
    return this.isUpdate && this.isShow;
  }

  onViewBudget(budget: BudgetPlannerVO): void {
    if (!budget) return;
    // Patch values only, do not enable/disable all controls
    this.budgetPlannerForm.patchValue({
      budgetType: budget.budgetType ?? '',
      budgetGenId: budget.budgetGenId ?? '',
      budgetVersion: budget.budgetVersion ?? '',
      vtypeId: budget.vtypeId ?? '',
      vtypeName: budget.vtypeName ?? '',
      routeMapCode1: budget.routeMapCode1 ?? '',
      routeMapCode2: budget.routeMapCode2 ?? '',
      totalKm: budget.totalKm ?? '',
      mileage: budget.mileage ?? '',
      fuelType: budget.fuelType ?? '',
      fuelRequired: budget.fuelRequired ?? '',
      fuelPrice: budget.fuelPrice ?? '',
      fuelPriceDate: budget.fuelPriceDate ?? '',
      fuelCharge: budget.fuelCharge ?? '',
      tollCharge: budget.tollCharge ?? '',
      tollCount: budget.tollCount ?? '',
      permitCharge: budget.permitCharge ?? '',
      driverBeta: budget.driverBeta ?? '',
      otherCharge: budget.otherCharge ?? '',
      tripTotalExpense: budget.tripTotalExpense ?? '',
      markupPercent: budget.markupPercent ?? '',
      markupAmount: budget.markupAmount ?? '',
      tripCost: budget.tripCost ?? '',
      noOfSeats: budget.noOfSeats ?? '',
      costPerSeat: budget.costPerSeat ?? '',
      isActive: budget.isActive ?? ''
    }, { emitEvent: false });
    this.isShow = true;
    this.isCreate = false;
    this.isUpdate = false;
    this.isDelete = false;
    this.isView = true;
    // Hide the table in view mode
    this.listBudgetVersionList = [];
    this.isListView = false;
    // Disable the entire form group for view mode
    //this.budgetPlannerForm.disable();
  }
}
