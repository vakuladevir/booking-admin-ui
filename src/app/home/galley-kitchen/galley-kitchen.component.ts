import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GalleyKitchenService } from '../../services/galleyKitchen.service';
import { GkItemCategoryService } from '../../services/gkItemCategory.service';
import { GalleyKitchenVO } from '../../model/galleyKitchenVO.model';
import { MessageDialogService } from '../../services/message-dialog.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-galley-kitchen',
  templateUrl: './galley-kitchen.component.html',
  styleUrls: ['./galley-kitchen.component.scss']
})
export class GalleyKitchenComponent implements OnInit {
  // Arrays for dropdown logic in Edit Modal
  itemNameArr: string[] = [];
  packSizeArr: string[] = [];
  // ...existing code...
  // openItemNameDropdown() {
  //   this.isItemNameDropdownOpen = this.filteredItemNameArr.length > 0;
  // }

  openItemNameDropdown() {
    // Always fetch and show all values on focus, and update local itemNameArr for latest items
    this.galleyKitchenService.getAllItemNameActive().subscribe((data) => {
      this.itemNameArr = Array.from(new Set(data));
      this.filteredItemNameArr = [...this.itemNameArr];
      this.isItemNameDropdownOpen = this.filteredItemNameArr.length > 0;
    });
  }

  closePackSizeDropdown() {
    setTimeout(() => { this.isPackSizeDropdownOpen = false; }, 200);
  }

  selectPackSize(size: string) {
    this.packSizeInput = size;
    this.filteredPackSizeArr = [];
    this.isPackSizeDropdownOpen = false;
  }
  galleyKitchenForm!: FormGroup;
  isShow = false;
  isCreate = false;
  isUpdate = false;
  isDelete = false;
  isView = false;
  isListView = false;
  isEdit = true;

  // Autocomplete for category
  categoryArr: string[] = [];
  filteredCategoryArr: string[] = [];
  isCategoryDropdownOpen = false;
  newCategoryName: string = '';
  // --- Add Category Modal Logic ---
  onAddCategory() {
    const name = this.newCategoryName?.trim();
    if (!name) return;
    // Optionally disable button or show loading
    this.gkItemCategoryService.createCategory({ categoryName: name }).subscribe({
      next: (resp) => {
        this.messageDialog.openDialog('Info', 'Category created successfully!', 'Ok');
        this.newCategoryName = '';
        // Reload categories, select the new one, and open the dropdown
        this.gkItemCategoryService.getAllCategoryName().subscribe({
          next: (data) => {
            this.categoryArr = data;
            this.filteredCategoryArr = data.filter(cat => cat.toLowerCase().includes(name.toLowerCase()));
            this.galleyKitchenForm.patchValue({ categoryName: name });
            // Open the dropdown to show the new category
            this.isCategoryDropdownOpen = this.filteredCategoryArr.length > 0;
          },
          error: () => {
            this.categoryArr = [];
            this.filteredCategoryArr = [];
          }
        });
      },
      error: (err) => {
        this.messageDialog.openDialog('Error', 'Failed to create category.', 'Close');
      }
    });
  }

  // Edit modal autocomplete
  itemNameInput = '';
  filteredItemNameArr: string[] = [];
  isItemNameDropdownOpen = false;
  packSizeInput = '';
  filteredPackSizeArr: string[] = [];
  isPackSizeDropdownOpen = false;

  // List view
  galleyKitchenList: GalleyKitchenVO[] = [];
  filteredGalleyKitchen: GalleyKitchenVO[] = [];
  searchText = '';

  // For edit/view
  selectedItem: GalleyKitchenVO | null = null;

  constructor(
    private fb: FormBuilder,
    private galleyKitchenService: GalleyKitchenService,
    private gkItemCategoryService: GkItemCategoryService,
    private messageDialog: MessageDialogService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    this.loadItemNamesAndPackSizes();
  }

  loadItemNamesAndPackSizes() {
    this.galleyKitchenService.getAllItemsActive().subscribe((items) => {
      this.itemNameArr = Array.from(new Set(items.map(i => i.itemName).filter((name): name is string => !!name)));
      this.packSizeArr = Array.from(new Set(items.map(i => i.packSize).filter((size): size is string => !!size)));
      this.filteredItemNameArr = [...this.itemNameArr];
      this.filteredPackSizeArr = [...this.packSizeArr];
    });
  }

  initForm() {
    this.galleyKitchenForm = this.fb.group({
      itemId: [''],
      itemName: ['', Validators.required],
      categoryId: [''],
      categoryName: ['', Validators.required],
      packSize: ['', Validators.required],
      landingPrice: ['', [Validators.required, Validators.min(0.01), Validators.max(100000)]],
      landingType: ['', Validators.required],
      landingTax: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      sellingPrice: ['', [Validators.required, Validators.min(0.01), Validators.max(100000)]],
      sellingTax: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
    });
  }

  loadCategories() {
    this.gkItemCategoryService.getAllCategoryName().subscribe({
      next: (data) => {
        this.categoryArr = data;
        this.filteredCategoryArr = data;
      },
      error: () => {
        this.categoryArr = [];
        this.filteredCategoryArr = [];
        // Optionally show a message: this.messageDialog.openDialog('Error', 'Could not load categories.', 'Close');
      }
    });
  }

  // --- Category Autocomplete ---
  onCategoryInput() {
    const val = this.galleyKitchenForm.get('categoryName')?.value?.toLowerCase() || '';
    this.filteredCategoryArr = this.categoryArr.filter(cat => cat.toLowerCase().includes(val));
    this.isCategoryDropdownOpen = this.filteredCategoryArr.length > 0;
  }
  selectCategory(cat: string) {
    this.galleyKitchenForm.patchValue({ categoryName: cat });
    this.isCategoryDropdownOpen = false;
  }
  closeCategoryDropdown() {
    setTimeout(() => { this.isCategoryDropdownOpen = false; }, 200);
  }

  // --- Create ---
  onCreateGalleyKitchen() {
    this.isShow = true;
    this.isCreate = true;
    this.isUpdate = false;
    this.isDelete = false;
    this.isView = false;
    this.isEdit = true;
    this.isListView = false;
    this.galleyKitchenForm.reset();
    this.galleyKitchenForm.enable();
  }

  onCreate() {
    if (this.galleyKitchenForm.valid) {
      const vo: GalleyKitchenVO = { ...this.galleyKitchenForm.value };
      this.galleyKitchenService.createItem(vo).subscribe({
        next: (resp) => {
          // Only show success dialog if response contains 'success', otherwise do nothing (let error callback handle errors)
          if (typeof resp === 'string' && resp.trim().toLowerCase().includes('success')) {
            this.messageDialog.openDialog('Info', resp, 'Ok');
            this.galleyKitchenForm.reset();
            this.isShow = false;
            this.onLoadGalleyKitchenList();
          }
        },
        error: () => {
          this.messageDialog.openDialog('Error', 'Failed to create item.', 'Close');
        }
      });
    } else {
      this.galleyKitchenForm.markAllAsTouched();
      setTimeout(() => {
        this.messageDialog.openDialog('Error', 'Please fill out all required fields.', 'Close');
      }, 0);
    }
  }

  // --- Edit Modal Logic ---

  // Call this when the Edit modal opens to fetch all unique active item names and update dropdown
  onEditModalOpen(): void {
    // Always fetch latest item names and clear modal inputs
    this.itemNameInput = '';
    this.packSizeInput = '';
    this.filteredItemNameArr = [];
    this.filteredPackSizeArr = [];
    this.isItemNameDropdownOpen = false;
    this.isPackSizeDropdownOpen = false;
    this.openItemNameDropdown();
  }
  // onItemNameInput() {
  //   if (!this.itemNameInput) {
  //     this.filteredItemNameArr = [];
  //     this.isItemNameDropdownOpen = false;
  //     return;
  //   }
  //   this.galleyKitchenService.getAllItemNameActive().subscribe((data) => {
  //     this.filteredItemNameArr = data.filter(name => name.toLowerCase().includes(this.itemNameInput.toLowerCase()));
  //     this.isItemNameDropdownOpen = this.filteredItemNameArr.length > 0;
  //   });
  // }
  onItemNameInput() {
    const val = this.itemNameInput?.toLowerCase() || '';
    this.filteredItemNameArr = this.itemNameArr.filter(name => name.toLowerCase().includes(val));
    // Only filter, do not open dropdown on input
    // Dropdown will open only on click/focus
  }

  selectItemName(name: string) {
    this.itemNameInput = name;
    this.filteredItemNameArr = [];
    this.isItemNameDropdownOpen = false;
    // Load pack sizes for this item and show dropdown
    this.galleyKitchenService.getAllItemsActive().subscribe((items) => {
      const sizes = items.filter(i => i.itemName === name).map(i => i.packSize).filter((size): size is string => !!size);
      this.filteredPackSizeArr = Array.from(new Set(sizes));
      // Show the pack size dropdown if there are values
      this.isPackSizeDropdownOpen = this.filteredPackSizeArr.length > 0;
    });
  }
  closeItemNameDropdown() {
    setTimeout(() => { this.isItemNameDropdownOpen = false; }, 200);
  }

  onPackSizeInput() {
    const val = this.packSizeInput?.toLowerCase() || '';
    // If an item is selected, filter pack sizes for that item only
    if (this.itemNameInput) {
      this.galleyKitchenService.getAllItemsActive().subscribe((items) => {
        const sizes = items.filter(i => i.itemName === this.itemNameInput).map(i => i.packSize).filter((size): size is string => !!size);
        this.filteredPackSizeArr = Array.from(new Set(sizes)).filter(size => size.toLowerCase().includes(val));
        this.isPackSizeDropdownOpen = this.filteredPackSizeArr.length > 0;
      });
    } else {
      this.filteredPackSizeArr = this.packSizeArr.filter(size => size.toLowerCase().includes(val));
      this.isPackSizeDropdownOpen = this.filteredPackSizeArr.length > 0;
    }
  }
  openPackSizeDropdown() {
    // If an item is selected, show all pack sizes for that item
    if (this.itemNameInput) {
      this.galleyKitchenService.getAllItemsActive().subscribe((items) => {
        const sizes = items.filter(i => i.itemName === this.itemNameInput).map(i => i.packSize).filter((size): size is string => !!size);
        this.filteredPackSizeArr = Array.from(new Set(sizes));
        this.isPackSizeDropdownOpen = this.filteredPackSizeArr.length > 0;
      });
    } else {
      this.filteredPackSizeArr = [...this.packSizeArr];
      this.isPackSizeDropdownOpen = this.filteredPackSizeArr.length > 0;
    }
  }

  onEditSearch() {
    // Find item by itemName and packSize
    this.galleyKitchenService.getAllItemsActive().subscribe((items) => {
      const found = items.find(i => i.itemName === this.itemNameInput && i.packSize === this.packSizeInput);
      if (found) {
        this.selectedItem = found;
        this.galleyKitchenForm.patchValue(found);
        this.galleyKitchenForm.enable(); // Enable all fields first
        this.isShow = true;
        this.isCreate = false;
        this.isUpdate = true;
        this.isDelete = true;
        this.isView = false;
        this.isEdit = true; // Allow editing of other fields
        this.isListView = false;
        this.galleyKitchenForm.get('itemName')?.disable();
        this.galleyKitchenForm.get('packSize')?.disable();
      } else {
        this.messageDialog.openDialog('Error', 'Item not found.', 'Close');
      }
    });
  }

  // --- Update ---
  onUpdate() {
    if (this.galleyKitchenForm.valid && this.selectedItem) {
      const vo: GalleyKitchenVO = { ...this.galleyKitchenForm.getRawValue(), itemId: this.selectedItem.itemId };
      this.galleyKitchenService.updateItem(this.selectedItem.itemId!, vo).subscribe({
        next: () => {
          this.messageDialog.openDialog('Info', 'Item updated successfully!', 'Ok');
          this.galleyKitchenForm.reset();
          this.isShow = false;
          this.isListView = false;
          this.onLoadGalleyKitchenList();
        },
        error: () => {
          this.messageDialog.openDialog('Error', 'Failed to update item.', 'Close');
        }
      });
    } else {
      this.galleyKitchenForm.markAllAsTouched();
      this.messageDialog.openDialog('Error', 'Please fill out all required fields.', 'Close');
    }
  }

  // --- Delete ---
  onDelete() {
    if (this.selectedItem && this.selectedItem.itemId) {
      this.galleyKitchenService.deleteItem(this.selectedItem.itemId).subscribe({
        next: (resp) => {
          const result = (typeof resp === 'string') ? resp.trim().toLowerCase() : '';
          if (result.includes('success')) {
            this.messageDialog.openDialog('Info', 'Item deleted successfully!', 'Ok');
            this.galleyKitchenForm.reset();
            this.isShow = false;
            this.isListView = false;
            this.onLoadGalleyKitchenList();
          } else {
            this.messageDialog.openDialog('Error', resp || 'Failed to delete item.', 'Close');
          }
        },
        error: () => {
          this.messageDialog.openDialog('Error', 'Failed to delete item.', 'Close');
        }
      });
    }
  }

  // --- List View ---
  onLoadGalleyKitchenList() {
    this.isListView = true;
    this.isShow = false;
    this.isCreate = false;
    this.isUpdate = false;
    this.isDelete = false;
    this.isView = false;
    this.galleyKitchenService.getAllItems().subscribe((data) => {
      this.galleyKitchenList = data;
      this.filteredGalleyKitchen = data;
    });
  }

  onSearchChange() {
    const search = this.searchText.toLowerCase();
    this.filteredGalleyKitchen = this.galleyKitchenList.filter(item =>
    (item.itemName?.toLowerCase().includes(search) ||
      item.categoryName?.toLowerCase().includes(search) ||
      item.packSize?.toLowerCase().includes(search))
    );
  }

  // --- View ---
  onView(item: GalleyKitchenVO) {
    this.selectedItem = item;
    this.galleyKitchenForm.patchValue(item);
    this.isShow = true;
    this.isCreate = false;
    this.isUpdate = false;
    this.isDelete = false;
    this.isView = true;
    this.isEdit = false;
    this.isListView = false;
    this.galleyKitchenForm.disable();
  }

  onBack() {
    this.galleyKitchenForm.reset();
    this.isShow = false;
    this.isListView = false;
  }

  onNavigateHome() {
    this.router.navigate(['/home']);
  }
}
