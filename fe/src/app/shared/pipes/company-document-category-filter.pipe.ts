import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'companyDocumentCategoryFilter'
})
export class CompanyDocumentCategoryFilterPipe implements PipeTransform {

  transform(items: any[], filter: Object): any {
    if (!items || !filter) {
        return items;
    }
    // filter items array, items which match and return true will be
    // kept, false will be filtered out
    console.log(items)
    return items.filter(item => !item.value || !item.value.category || item.value.category == filter);
}

}
