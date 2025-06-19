import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, map, shareReplay, startWith, switchMap, tap, take } from 'rxjs/operators';
import { ProductControllerService } from 'src/api/api/productController.service';
import { ApiPaginatedResponseApiProductLabelBatch } from 'src/api/model/apiPaginatedResponseApiProductLabelBatch';
import { AuthService } from 'src/app/core/auth.service';
import { GlobalEventManagerService } from 'src/app/core/global-event-manager.service';
import { NgbModalImproved } from 'src/app/core/ngb-modal-improved/ngb-modal-improved.service';

@Component({
  selector: 'app-batches-list',
  templateUrl: './batches-list.component.html',
  styleUrls: ['./batches-list.component.scss']
})
export class BatchesListComponent implements OnInit {

  batches = [];

  searchName = new FormControl(null)

  reloadPing$ = new BehaviorSubject<boolean>(false)
  pagingParams$ = new BehaviorSubject({})
  sortingParams$ = new BehaviorSubject({ sortBy: 'name', sort: 'ASC' })
  paging$ = new BehaviorSubject<number>(1);

  page: number = 0;
  pageSize = 10;

  allBatches: number = 0;
  showedBatches: number = 0;
  goToLink: string = this.router.url.substr(0, this.router.url.lastIndexOf("/"));

  searchParams$ = combineLatest(
    this.searchName.valueChanges.pipe(
      startWith(null),
      debounceTime(200)
    ),
    (number: string) => {
      return { number }
    }
  )

  constructor(
    private productController: ProductControllerService,
    private router: Router,
    private route: ActivatedRoute,
    protected globalEventsManager: GlobalEventManagerService
  ) { }

  ngOnInit(): void {
    this.setAllBatches().then();
  }

  reloadPage() {
    this.reloadPing$.next(true)
  }

  onPageChange(event) {
    this.paging$.next(event);
  }

  async setAllBatches() {
    let labelId = this.route.snapshot.params.labelId
    let res = await this.productController.getProductLabelBatches(labelId, 'COUNT').pipe(take(1)).toPromise();
      if (res && res.status === 'OK' && res.data && res.data.count >= 0) {
        this.allBatches = res.data.count;
      }
  }

  batches$ = combineLatest(this.reloadPing$, this.paging$, this.searchParams$, this.sortingParams$,
    (ping: boolean, page: number, search: any, sorting: any) => {
      return {
        ...search,
        ...sorting,
        offset: (page - 1) * this.pageSize,
        limit: this.pageSize
      }
    }).pipe(
      // distinctUntilChanged((prev, curr) => isEqual(prev, curr)),
      tap(val => this.globalEventsManager.showLoading(true)),
      switchMap(params => {
        let labelId = this.route.snapshot.params.labelId
        return this.productController.getProductLabelBatchesByMap({...params, id: labelId})
      }),
      map((resp: ApiPaginatedResponseApiProductLabelBatch) => {
        if (resp) {
          if (resp.data && resp.data.count && (this.pageSize - resp.data.count > 0)) this.showedBatches = resp.data.count;
          else {
            let temp = resp.data.count - (this.pageSize * (this.page - 1));
            this.showedBatches = temp >= this.pageSize ? this.pageSize : temp;
          }
          return resp.data
        }
      }),
      tap(val => this.globalEventsManager.showLoading(false)),
      shareReplay(1)
    )

  createBatch() {
    let productId = this.route.snapshot.params.id;
    let labelId = this.route.snapshot.params.labelId;
    let r = 'product-labels/' + productId + '/labels/' + labelId + '/batches/new';
    this.router.navigate([r]);
  }

   editBatch(id) {
     let productId = this.route.snapshot.params.id;
     let labelId = this.route.snapshot.params.labelId;
     this.router.navigate(['product-labels', productId, 'labels', labelId, 'batches', id]);
  }

  async deleteBatch(batch) {
    let result = await this.globalEventsManager.openMessageModal({
      type: 'warning',
      message: $localize`:@@batchesList.deleteBatch.error.message:Are you sure you want to delete the batch?`,
      options: { centered: true }
    });
    if(result != "ok") return
    let res = await this.productController.deleteProductLabelBatchByMap(batch).pipe(take(1)).toPromise();
    if(res && res.status == 'OK') {
      this.reloadPage()
    }
  }

  changeSort(event) {
    this.sortingParams$.next({ sortBy: event.key, sort: event.sortOrder })
  }

  sortOptions = [
    {
      key: 'number',
      name: $localize`:@@batchesList.sortOptions.number.name:Batch number`,
      defaultSortOrder: 'ASC'
      // inactive?: boolean;
    },
    {
      key: 'productionDate',
      name: $localize`:@@batchesList.sortOptions.productionDate.name:Production date`,
      // defaultSortOrder?: SortOrder;
      // inactive?: boolean;
    },
    {
      key: 'expiryDate',
      name: $localize`:@@batchesList.sortOptions.expiryDate.name:Expiry date`,
      // defaultSortOrder?: SortOrder;
      // inactive: true
    },
    {
      key: 'actions',
      name: $localize`:@@batchesList.sortOptions.actions.name:Actions`,
      inactive: true
    }
  ]

  showPagination() {
    if (((this.showedBatches - this.pageSize) == 0 && this.allBatches >= this.pageSize) || this.page > 1) return true;
    else return false
  }
}
