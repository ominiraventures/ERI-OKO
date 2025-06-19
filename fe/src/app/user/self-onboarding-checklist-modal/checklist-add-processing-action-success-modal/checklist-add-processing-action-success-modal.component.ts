import { Component, OnInit } from '@angular/core';
import { SelfOnboardingChecklistModalComponent } from "../self-onboarding-checklist-modal.component";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { NgbModalImproved } from "../../../core/ngb-modal-improved/ngb-modal-improved.service";
import { SelfOnboardingService } from "../../../shared-services/self-onboarding.service";

@Component({
  selector: 'app-checklist-add-processing-action-success-modal',
  templateUrl: './checklist-add-processing-action-success-modal.component.html',
  styleUrls: ['./checklist-add-processing-action-success-modal.component.scss', '../self-onboarding-checklist-modal.component.scss']
})
export class ChecklistAddProcessingActionSuccessModalComponent implements OnInit {

  constructor(
      private activeModal: NgbActiveModal,
      private modalService: NgbModalImproved,
      private selfOnboardingService: SelfOnboardingService
  ) { }

  ngOnInit(): void {
  }

  continue() {
    this.selfOnboardingService.clearAddProcessingActionCurrentStep();
    this.activeModal.dismiss();
    this.modalService.open(SelfOnboardingChecklistModalComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      size: 'md',
      windowClass: 'self-onboarding-checklist-modal-class',
    });
  }

}
