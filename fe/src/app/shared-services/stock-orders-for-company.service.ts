import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// CORRECTED: Changed ListStockOrders to GetStockOrder
import { StockOrderControllerService, GetStockOrder } from 'src/api/api/stockOrderController.service'; 
import { ApiPaginatedResponseApiStockOrder } from 'src/api/model/apiPaginatedResponseApiStockOrder';
import { ApiStockOrder } from 'src/api/model/apiStockOrder';
import { PagedSearchResults } from 'src/interfaces/CodebookHelperService';
import { GeneralSifrantService } from './general-sifrant.service';

@Injectable({
    providedIn: 'root'
})
export class StockOrdersForCompanyService extends GeneralSifrantService<ApiStockOrder> {

    requestParams = {
        limit: 1000,
        offset: 0,
    } as GetStockOrder.PartialParamMap; // CORRECTED: Changed ListStockOrders to GetStockOrder

    constructor(
        private stockOrderControllerService: StockOrderControllerService,
    ) {
        super();
    }

    public makeQuery(key: string, params?: any, companyId?: string): Observable<PagedSearchResults<ApiStockOrder>> {

        const limit = params && params.limit ? params.limit : this.limit();

        const reqPars = {
            ...this.requestParams,
            ...params, // Pass all other params
            companyId: companyId
        };

        // CORRECTED: Changed listStockOrdersByMap to getStockOrderByMap
        return this.stockOrderControllerService.getStockOrderByMap(reqPars).pipe(
            map((res: ApiPaginatedResponseApiStockOrder) => {
                return {
                    results: res.data.items,
                    offset: 0,
                    limit,
                    totalCount: res.data.count
                };
            })
        );
    }
}