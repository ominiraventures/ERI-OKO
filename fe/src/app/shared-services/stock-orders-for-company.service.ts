import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StockOrderControllerService } from 'src/api/api/stockOrderController.service';
import { ApiPaginatedResponseApiStockOrder } from 'src/api/model/apiPaginatedResponseApiStockOrder';
import { ApiStockOrder } from 'src/api/model/apiStockOrder';
import { PagedSearchResults } from 'src/interfaces/CodebookHelperService';
import { GeneralSifrantService } from './general-sifrant.service';

@Injectable()
export class StockOrdersForCompanyService extends GeneralSifrantService<ApiStockOrder> {

    constructor(
        private stockOrderControllerService: StockOrderControllerService,
        private companyId?: number,
        private farmerId?: number,
        private forPayment?: boolean,
        private womenCoffeeOnly?: boolean,
        private certificateId?: number,
        private orderType?: any,
        private plotId?: number,
        private deliveryId?: number,
        private valueChainId?: number,
    ) {
        super();
    }

    public makeQuery(key: string, params?: any): Observable<PagedSearchResults<ApiStockOrder>> {
        const limit = params && params.limit ? params.limit : this.limit();

        const reqPars = {
            limit: limit,
            offset: 0,
            search: key,
            farmerId: this.farmerId,
            forPayment: this.forPayment,
            womenCoffeeOnly: this.womenCoffeeOnly,
            certificateId: this.certificateId,
            orderType: this.orderType,
            plotId: this.plotId,
            deliveryId: this.deliveryId,
            valueChainId: this.valueChainId
        };

        // THIS IS THE FINAL CORRECTION: Using the correct method name 'getStockOrderByMap'.
        return this.stockOrderControllerService.getStockOrderByMap(reqPars, this.companyId).pipe(
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