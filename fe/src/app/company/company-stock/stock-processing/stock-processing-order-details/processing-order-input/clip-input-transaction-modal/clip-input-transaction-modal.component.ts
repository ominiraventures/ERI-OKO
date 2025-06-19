import { Component, Input, OnInit } from '@angular/core';
import { ApiStockOrder } from '../../../../../../../api/model/apiStockOrder';
import { FormControl, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ClipInputTransactionModalResult } from './model';

@Component({
  selector: 'app-clip-input-transaction-modal',
  templateUrl: './clip-input-transaction-modal.component.html',
  styleUrls: ['./clip-input-transaction-modal.component.scss']
})
export class ClipInputTransactionModalComponent implements OnInit {

  @Input()
  stockOrder: ApiStockOrder;

  @Input()
  currentSelectedQuantity: number;

  submitted = false;

  selectedQuantityForm: FormControl;

  constructor(
    public activeModal: NgbActiveModal,
  ) { }

  get inputHelpText() {
    const measureUnitLabel = this.stockOrder.measureUnitType.label;
    return $localize`:@@productLabelStockProcessingOrderDetail.clipInputModal.inputQuantity.helpText:Available quantity` +
      `: ${this.stockOrder.availableQuantity} ${measureUnitLabel}`;
  }

  ngOnInit(): void {

    if (!this.stockOrder) {
      return;
    }

    this.selectedQuantityForm = new FormControl(null, [Validators.required, Validators.max(this.stockOrder.availableQuantity)]);

    if (this.currentSelectedQuantity) {
      this.selectedQuantityForm.setValue(this.currentSelectedQuantity);
    }
  }

  cancel() {
    this.activeModal.close();
  }

  confirm() {

    this.submitted = true;
    if (this.selectedQuantityForm.invalid) {
      return;
    }

    const result: ClipInputTransactionModalResult = {
      selectedQuantity: Number(this.selectedQuantityForm.value)
    };

    this.activeModal.close(result);
  }

}
