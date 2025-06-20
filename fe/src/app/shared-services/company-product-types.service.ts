import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PagedSearchResults } from 'src/interfaces/CodebookHelperService';
import { GeneralSifrantService } from './general-sifrant.service';
import { ApiProductType } from '../../api/model/apiProductType';
import { ApiPaginatedResponseApiProductType } from '../../api/model/apiPaginatedResponseApiProductType';
import { CompanyControllerService, GetCompanyProductTypes } from '../../api/api/companyController.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyProductTypesService extends GeneralSifrantService<ApiProductType> {

  // CORRECTED: Constructor is restored to its original form to fix the TS2554 error.
  constructor(
    private codebookService: CompanyControllerService,
    private companyId: number
  ) {
    super();
  }

  requestParams = {
    limit: 1000,
    offset: 0,
  } as GetCompanyProductTypes.PartialParamMap;

  public identifier(el: ApiProductType) {
    return el.id;
  }

  public textRepresentation(el: ApiProductType) {
    return `${el.name}`;
  }

  // CORRECTED: The method signature now matches the parent class to fix the TS2416 error.
  public makeQuery(key: string, params?: any): Observable<PagedSearchResults<ApiProductType>> {
    const limit = params && params.limit ? params.limit : this.limit();

    const reqParams = {
      ...this.requestParams,
      id: this.companyId, // It now uses the companyId passed in via the constructor.
    };

    return this.codebookService.getCompanyProductTypesByMap(reqParams).pipe(
      map((res: ApiPaginatedResponseApiProductType) => {
        return {
          results: res.data.items,
          offset: 0,
          limit,
          totalCount: res.data.count,
        };
      })
    );
  }

  public placeholder(): string {
    return $localize`:@@productTypeInCompany.input.placehoder:Select product types`;
  }
}