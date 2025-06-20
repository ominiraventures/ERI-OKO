import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PagedSearchResults } from 'src/interfaces/CodebookHelperService';
import { GeneralSifrantService } from 'src/app/shared-services/general-sifrant.service';
import { ApiSemiProduct } from 'src/api/model/apiSemiProduct';

@Injectable() // Note: No 'providedIn'
export class StaticSemiProductsService extends GeneralSifrantService<ApiSemiProduct> {

  // CORRECTED: Data is passed in via a method, not constructor
  private semiProducts: ApiSemiProduct[] = [];

  constructor() {
    super();
  }

  public setData(semiProducts: ApiSemiProduct[]) {
    this.semiProducts = semiProducts;
  }

  public makeQuery(key: string, params?: any): Observable<PagedSearchResults<ApiSemiProduct>> {
    return of({
      results: this.semiProducts,
      offset: 0,
      limit: this.semiProducts.length,
      totalCount: this.semiProducts.length
    });
  }
}