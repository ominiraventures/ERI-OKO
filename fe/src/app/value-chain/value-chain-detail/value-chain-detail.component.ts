import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ValueChainControllerService } from '../../../api/api/valueChainController.service';
import { finalize, take } from 'rxjs/operators';
import { GlobalEventManagerService } from '../../core/global-event-manager.service';
import { defaultEmptyObject, generateFormFromMetadata } from '../../../shared/utils';
import { ApiValueChain } from '../../../api/model/apiValueChain';
import {
  ApiSemiProductValidationScheme, ApiValueChainValidationScheme, ApiVCMeasureUnitTypeValidationScheme,
  ApiVCProcessingEvidenceFieldValidationScheme, ApiVCProcessingEvidenceTypeValidationScheme
} from './validation';
import { ListEditorManager } from '../../shared/list-editor/list-editor-manager';
import { ApiFacilityType } from '../../../api/model/apiFacilityType';
import { ApiMeasureUnitType } from '../../../api/model/apiMeasureUnitType';
import {
  ApiFacilityTypeValidationScheme
} from '../../settings/type-detail-modal/validation';
import { ApiProcessingEvidenceType } from '../../../api/model/apiProcessingEvidenceType';
import { ApiSemiProduct } from '../../../api/model/apiSemiProduct';
import { ApiResponseApiBaseEntity } from '../../../api/model/apiResponseApiBaseEntity';
import StatusEnum = ApiResponseApiBaseEntity.StatusEnum;
import ValueChainStatusEnum = ApiValueChain.ValueChainStatusEnum;
import { ApiProcessingEvidenceField } from '../../../api/model/apiProcessingEvidenceField';
import { ProductTypeControllerService } from '../../../api/api/productTypeController.service';
import { ProductTypesService } from '../../shared-services/product-types.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-value-chain-detail',
  templateUrl: './value-chain-detail.component.html',
  styleUrls: ['./value-chain-detail.component.scss']
})
export class ValueChainDetailComponent implements OnInit {

  valueChainDetailForm: FormGroup;

  submitted = false;

  title: string;

  facilityTypeListManager: ListEditorManager<ApiFacilityType>;
  measureUnitTypeListManager: ListEditorManager<ApiMeasureUnitType>;
  processingEvidenceTypeListManger: ListEditorManager<ApiProcessingEvidenceType>;
  processingEvidenceFieldListManger: ListEditorManager<ApiProcessingEvidenceField>;
  semiProductsListManager: ListEditorManager<ApiSemiProduct>;

  productTypeCodebook: ProductTypesService;

  isRegionalAdmin = false;

  constructor(
    protected route: ActivatedRoute,
    private router: Router,
    private valueChainService: ValueChainControllerService,
    private globalEventsManager: GlobalEventManagerService,
    private productControllerService: ProductTypeControllerService,
    private authService: AuthService
  ) { }

  // Facility type form factory methods (used when creating ListEditorManager)
  static ApiVCFacilityTypeCreateEmptyObject(): ApiFacilityType {
    const obj = ApiFacilityType.formMetadata();
    return defaultEmptyObject(obj) as ApiFacilityType;
  }

  static ApiVCFacilityTypeEmptyObjectFormFactory(): () => FormControl {
    return () => {
      return new FormControl(ValueChainDetailComponent.ApiVCFacilityTypeCreateEmptyObject(),
        ApiFacilityTypeValidationScheme.validators);
    };
  }

  // Measuring unit type form factory methods (used when creating ListEditorManager)
  static ApiVCMeasureUnitTypeCreateEmptyObject(): ApiMeasureUnitType {
    const obj = ApiMeasureUnitType.formMetadata();
    return defaultEmptyObject(obj) as ApiMeasureUnitType;
  }

  static ApiVCMeasureUnitTypeEmptyObjectFormFactory(): () => FormControl {
    return () => {
      return new FormControl(ValueChainDetailComponent.ApiVCMeasureUnitTypeCreateEmptyObject(),
        ApiVCMeasureUnitTypeValidationScheme.validators);
    };
  }

  // Processing evidence type form factory methods (used when creating ListEditorManager)
  static ApiVCProcEvidenceTypeCreateEmptyObject(): ApiProcessingEvidenceType {
    const obj = ApiProcessingEvidenceType.formMetadata();
    return defaultEmptyObject(obj) as ApiProcessingEvidenceType;
  }

  static ApiVCProcEvidenceTypeEmptyObjectFormFactory(): () => FormControl {
    return () => {
      return new FormControl(ValueChainDetailComponent.ApiVCProcEvidenceTypeCreateEmptyObject(),
        ApiVCProcessingEvidenceTypeValidationScheme.validators);
    };
  }

  // Processing evidence field form factory methods (used when creating ListEditorManager)
  static ApiVCProcEvidenceFieldCreateEmptyObject(): ApiProcessingEvidenceField {
    const obj = ApiProcessingEvidenceField.formMetadata();
    return defaultEmptyObject(obj) as ApiProcessingEvidenceField;
  }

  static ApiVCProcEvidenceFieldEmptyObjectFormFactory(): () => FormControl {
    return () => {
      return new FormControl(ValueChainDetailComponent.ApiVCProcEvidenceFieldCreateEmptyObject(),
        ApiVCProcessingEvidenceFieldValidationScheme.validators);
    };
  }

  // Semi-products form factory methods (used when creating ListEditorManager)
  static ApiVCSemiProductsCreateEmptyObject(): ApiSemiProduct {
    const obj = ApiSemiProduct.formMetadata();
    return defaultEmptyObject(obj) as ApiSemiProduct;
  }

  static ApiVCSemiProductsEmptyObjectFormFactory(): () => FormControl {
    return () => {
      return new FormControl(ValueChainDetailComponent.ApiVCSemiProductsCreateEmptyObject(),
        ApiSemiProductValidationScheme.validators);
    };
  }

  get mode() {
    const id = this.route.snapshot.params.id;
    return id == null ? 'create' : 'update';
  }

  get changed() {
    return this.valueChainDetailForm.dirty;
  }

  get vcFacilityTypes(): FormControl[] {
    return (this.valueChainDetailForm.get('facilityTypes') as FormArray).controls as FormControl[];
  }

  get vcMeasureUnitTypes(): FormControl[] {
    return (this.valueChainDetailForm.get('measureUnitTypes') as FormArray).controls as FormControl[];
  }

  get vcProcEvidenceTypes(): FormControl[] {
    return (this.valueChainDetailForm.get('processingEvidenceTypes') as FormArray).controls as FormControl[];
  }

  get vcProcEvidenceFields(): FormControl[] {
    return (this.valueChainDetailForm.get('processingEvidenceFields') as FormArray).controls as FormControl[];
  }

  get vcSemiProducts(): FormControl[] {
    return (this.valueChainDetailForm.get('semiProducts') as FormArray).controls as FormControl[];
  }

  ngOnInit(): void {

    this.authService.userProfile$.pipe(take(1)).subscribe(up => {
      this.isRegionalAdmin = up?.role === 'REGIONAL_ADMIN';
    });

    if (this.mode === 'update') {
      this.title = $localize`:@@valueChainDetail.title.edit:Edit value chain`;
      this.getValueChain();
    } else {
      this.title = $localize`:@@valueChainDetail.title.add:Create new value chain`;
      this.newValueChain();
    }

    this.productTypeCodebook = new ProductTypesService(this.productControllerService);
  }

  public canDeactivate(): boolean {
    return !this.valueChainDetailForm || !this.valueChainDetailForm.dirty;
  }

  public getProductTypeFromControl(): FormControl {
    return this.valueChainDetailForm.get('productType') as FormControl;
  }

  private getValueChain() {
    this.globalEventsManager.showLoading(true);
    const id = this.route.snapshot.paramMap.get('id');
    this.valueChainService.getValueChain(Number(id))
      .pipe(
        finalize(() => this.globalEventsManager.showLoading(false))
      )
      .subscribe(
        valueChain => {
          this.valueChainDetailForm =
            generateFormFromMetadata(ApiValueChain.formMetadata(), valueChain.data, ApiValueChainValidationScheme);

          if (this.mode === 'update' && valueChain.data.valueChainStatus === ValueChainStatusEnum.DISABLED) {
            this.valueChainDetailForm.disable();
          }

          // If viewing as a Regional admin disable the form
          if (this.isRegionalAdmin) {
            this.valueChainDetailForm.disable();
          }

          this.initializeListManagers();
        }
      );
  }

  private newValueChain() {
    this.valueChainDetailForm =
      generateFormFromMetadata(ApiValueChain.formMetadata(), {} as ApiValueChain, ApiValueChainValidationScheme);
    this.initializeListManagers();
  }

  validate() {
    this.submitted = true;
  }

  save() {

    this.submitted = true;

    if (this.valueChainDetailForm.invalid) {
      this.globalEventsManager.push({
        action: 'error',
        notificationType: 'error',
        title: $localize`:@@valueChainDetail.saveValueChain.error.title:Error`,
        message: $localize`:@@valueChainDetail.saveValueChain.error.message:Validation errors on page. Please check!`
      });
      return;
    }

    this.createOrUpdateValueChain();
  }

  create() {

    this.submitted = true;

    if (this.valueChainDetailForm.invalid) {
      this.globalEventsManager.push({
        action: 'error',
        notificationType: 'error',
        title: $localize`:@@valueChainDetail.createValueChain.error.title:Error`,
        message: $localize`:@@valueChainDetail.createValueChain.error.message:Validation errors on page. Please check!`
      });
      return;
    }

    this.createOrUpdateValueChain();
  }

  private createOrUpdateValueChain(): void {

    this.globalEventsManager.showLoading(true);
    this.valueChainService.createOrUpdateValueChain(this.valueChainDetailForm.value)
      .pipe(
        finalize(() => this.globalEventsManager.showLoading(false))
      )
      .subscribe(
        response => {
          if (response && response.status === StatusEnum.OK) {
            this.valueChainDetailForm.markAsPristine();
            this.router.navigate(['value-chains']).then();
          }
        }
      );
  }

  private initializeListManagers() {

    this.facilityTypeListManager = new ListEditorManager<ApiFacilityType>(
      this.valueChainDetailForm.get('facilityTypes') as FormArray,
      ValueChainDetailComponent.ApiVCFacilityTypeEmptyObjectFormFactory(),
      ApiFacilityTypeValidationScheme);

    this.measureUnitTypeListManager = new ListEditorManager<ApiMeasureUnitType>(
      this.valueChainDetailForm.get('measureUnitTypes') as FormArray,
      ValueChainDetailComponent.ApiVCMeasureUnitTypeEmptyObjectFormFactory(),
      ApiVCMeasureUnitTypeValidationScheme);

    this.processingEvidenceTypeListManger = new ListEditorManager<ApiProcessingEvidenceType>(
      this.valueChainDetailForm.get('processingEvidenceTypes') as FormArray,
      ValueChainDetailComponent.ApiVCProcEvidenceTypeEmptyObjectFormFactory(),
      ApiVCProcessingEvidenceTypeValidationScheme);

    this.processingEvidenceFieldListManger = new ListEditorManager<ApiProcessingEvidenceType>(
      this.valueChainDetailForm.get('processingEvidenceFields') as FormArray,
      ValueChainDetailComponent.ApiVCProcEvidenceFieldEmptyObjectFormFactory(),
      ApiVCProcessingEvidenceFieldValidationScheme);

    this.semiProductsListManager = new ListEditorManager<ApiSemiProduct>(
      this.valueChainDetailForm.get('semiProducts') as FormArray,
      ValueChainDetailComponent.ApiVCSemiProductsEmptyObjectFormFactory(),
      ApiSemiProductValidationScheme);
  }

}
