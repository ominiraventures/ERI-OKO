import {AbstractControl, FormArray, FormControl, FormGroup} from '@angular/forms';
import {SimpleValidationScheme} from 'src/interfaces/Validation';
import {ActivatedRoute, ActivatedRouteSnapshot, Router} from '@angular/router';
import {take} from 'rxjs/operators';
import {GeneralSifrantService} from 'src/app/shared-services/general-sifrant.service';

/**
 * Like map() on lists, but for js/ts objects.
 * @param obj an object
 * @param func a function mapping (key, value) pairs to new value
 */
export function objectMap<T, R>(obj: T, func: (key: keyof T, value: any) => R): { [k in keyof T]: R } {
  const result = {};
  for (const key of Object.keys(obj)) {
    result[key] = func(key as keyof T, obj[key]);
  }
  // the typecast should be safe - all non-optional fields of T must be in obj and will therefore be in result
  return result as { [k in keyof T]: R };
}

/**
 * Return value if not null or undefined, otherwise default value.
 */
export function defaultIfNull<T>(value: T, defaultValue: T): T {
  return value != null ? value : defaultValue;
}

/**
 * Extract some keys from object
 */
export function objectSlice<T>(obj: T, keys: Array<keyof T>): Partial<T> {
  let result: Partial<T> = {};
  for (let key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

export function pripraviSifrant(obj: any, forceLowercase = false) {
  let options = []
  if (Array.isArray(obj)) {
    for (let key of obj) {
      options.push(
        {
          id: forceLowercase ? (key as string).toLocaleLowerCase() : key,
          value: forceLowercase ? (obj[key] as string).toLocaleLowerCase() : obj[key]
        }
      )
    }
    return options;
  }

  // Iz enumov generiranih s pomočjo generatorja
  if (typeof obj === "object") {
    for (let key in obj) {
      options.push(
        {
          id: forceLowercase ? (key as string).toLocaleLowerCase() : key,
          value: forceLowercase ? (obj[key] as string).toLocaleLowerCase() : obj[key]
        }
      )
    }
    return options;
  }
  return [];

}

export function removeValidators(form: FormGroup, fields: Array<string>) {
  fields.forEach(key => {
    form.controls[key].clearValidators()
    form.controls[key].updateValueAndValidity()
  })
}

export function getParentKey(form: AbstractControl): string {
  if (!form.parent)
    return null
  for (let key in form.parent.controls) {
    if (form.parent.controls[key] == form) {
      return key;
    }
  }
  return null
}

export function isRequired(form: AbstractControl) {
  if (!form.validator) {
    return false;
  }
  const validator = form.validator({} as AbstractControl);
  return (validator && validator.required);
}

export function applyValidationScheme(inForm: AbstractControl, valScheme: SimpleValidationScheme<any>) {
  let form = inForm;
  // if(valScheme.forceFormControl) {   // transfocija v form control
  //     let key = getParentKey(form) as string;
  //     let value = form.value;
  //     let parent: FormGroup = form.parent as FormGroup;
  //     parent.setControl(key, new FormControl(value));
  //     form = parent.controls[key]
  // }
  // if (!form.value) {
  //     // if(empty) {
  //     if (valScheme.empty) {
  //         form.setValidators(valScheme.empty)
  //     }
  // } else {
  //     form.setValidators(valScheme.validators)
  // }
  form.setValidators(valScheme.validators)
  if (!form.value) return
  if (valScheme.fields) { // form group
    for (let key in valScheme.fields) {
      if (!(form as FormGroup).controls[key]) {
        throw Error("Non matching key for validation scheme: " + key)
      }
      applyValidationScheme((form as FormGroup).controls[key], valScheme.fields[key]);
      (form as FormGroup).controls[key].updateValueAndValidity()
    }
  } else if (valScheme.arrayElementValidators) {
    (form as FormArray).controls.forEach((a: AbstractControl) => {
      applyValidationScheme(a, valScheme.arrayElementValidators)
      a.updateValueAndValidity()
    })
  }
  form.updateValueAndValidity()
}

export function duplicateValidationScheme(valScheme: SimpleValidationScheme<any>): SimpleValidationScheme<any> {
  let dup: any = {
    validators: [...valScheme.validators],
    forceFormControl: valScheme.forceFormControl,
    forceExpand: valScheme.forceExpand
  }
  if (valScheme.arrayElementValidators) {
    dup.arrayElementValidators = duplicateValidationScheme(valScheme.arrayElementValidators);
  }
  if (valScheme.fields) {
    dup.fields = {}
    for (let key in valScheme.fields) {
      dup.fields[key] = duplicateValidationScheme(valScheme.fields[key])
    }
  }
  return dup;
}

export function setForceFormControl(valScheme: SimpleValidationScheme<any>, value: boolean = true) {
  let vs = duplicateValidationScheme(valScheme)
  vs.forceFormControl = value;
  return vs
}

export function setForceExpand(valScheme: SimpleValidationScheme<any>, value: boolean = true) {
  let vs = duplicateValidationScheme(valScheme)
  vs.forceExpand = value;
  return vs
}


export function generateFormFromMetadata(metadata: any, model: any, valScheme?: SimpleValidationScheme<any>): FormGroup {
  let result = new FormGroup({})
  for (let varInfo of metadata.vars) {
    let name = varInfo.name
    let value = model[varInfo.name]
    let validators = valScheme && valScheme.fields && valScheme.fields[varInfo.name] && valScheme.fields[varInfo.name].validators
    let forceFormControl = valScheme && valScheme.fields && valScheme.fields[varInfo.name] && valScheme.fields[varInfo.name].forceFormControl
    let forceExpand = valScheme && valScheme.fields && valScheme.fields[varInfo.name] && valScheme.fields[varInfo.name].forceExpand
    let fieldSchema = valScheme && valScheme.fields && valScheme.fields[varInfo.name]
    let arrayElementsSchema = valScheme && valScheme.fields && valScheme.fields[varInfo.name] && valScheme.fields[varInfo.name].arrayElementValidators
    if (forceFormControl && forceExpand) {
      throw Error("forceFormControl in forceExpand must not be true at the same time.")
    }
    if (value == null && varInfo.required && !(varInfo.isListContainer || varInfo.isPrimitiveType || varInfo.isEnum)) {
      throw Error("Required complex variable missing: " + name + `(${ varInfo.classname })`)
    }
    if (varInfo.isPrimitiveType) {
      if (varInfo.isListContainer) {
        result.setControl(name, new FormArray(
          value
            ? value.map(x => {
              if (arrayElementsSchema && arrayElementsSchema.forceExpand) {
                // metadata for listContainer vars describe element's metadata
                return generateFormFromMetadata(varInfo.metadata(), x, arrayElementsSchema)
              } else {
                // default
                return new FormControl(x, arrayElementsSchema && arrayElementsSchema.validators)
              }
            })
            : []
          , validators))
      } else {
        result.setControl(name, new FormControl(value, validators))
      }

    } else if (varInfo.isListContainer) {
      if (forceFormControl) {
        result.setControl(name, new FormControl(value, validators))
      } else {
        // default for arrays is expansion to FormArray with FormControl elements
        result.setControl(name, new FormArray(
          value
            ? value.map(x => {
              if (arrayElementsSchema && arrayElementsSchema.forceExpand) {
                // metadata for listContainer vars describe element's metadata
                return generateFormFromMetadata(varInfo.metadata(), x, arrayElementsSchema)
              } else {
                // default
                return new FormControl(x, arrayElementsSchema && arrayElementsSchema.validators)
              }
            })
            : []
          , validators))
      }
    } else {
      if (varInfo.isEnum) {
        result.setControl(name, new FormControl(value, validators))
      } else {
        if (forceExpand) {
          if (value != null) {
            result.setControl(name, generateFormFromMetadata(varInfo.metadata(), value, fieldSchema))
          } else {
            // this is exotic case, where FormControl is used instead of FormGroup.
            // component handling this case must be able to manage changes between FormGroup and FormControl
            result.setControl(name, new FormControl(null))
          }

        } else {
          // default for formgroups is formcontrol
          result.setControl(name, new FormControl(value, validators))
        }
      }
    }
  }
  if (valScheme && valScheme.validators) {
    result.setValidators(valScheme.validators)
  }
  result.updateValueAndValidity()
  return result
}


export function defaultEmptyObject(metadata: any) {
  let result = {}
  for (let varInfo of metadata.vars) {
    let name = varInfo.name
    if (varInfo.isPrimitiveType) {
      result[name] = null
    } else if (varInfo.isListContainer) {
      result[name] = []
    } else {
      if (varInfo.isEnum) {
        result[name] = null
      } else {
        result[name] = null
      }
    }
  }
  return result
}

export function formAssign(form: FormGroup, metadata: any, model: any, valScheme: SimpleValidationScheme<any>) {
  for (let varInfo of metadata.vars) {
    let name = varInfo.name
    let value = model[varInfo.name]
    let validators = valScheme && valScheme.fields && valScheme.fields[varInfo.name] && valScheme.fields[varInfo.name].validators
    let forceFormControl = valScheme && valScheme.fields && valScheme.fields[varInfo.name].forceFormControl
    let fieldSchema = valScheme && valScheme.fields && valScheme.fields[varInfo.name]
    let arrayElementsSchema = valScheme && valScheme.fields && valScheme.fields[varInfo.name] && valScheme.fields[varInfo.name].arrayElementValidators

    if (forceFormControl || varInfo.isPrimitiveType) {
      form.get(name).setValue(value)
    } else if (varInfo.isListContainer) {
      let fa = form.get(name) as FormArray
      fa.clear()
      for (let el of value) {
        fa.push(generateFormFromMetadata(varInfo.metadata(), el, arrayElementsSchema))
      }
    } else {
      if (varInfo.isEnum) {
        form.get(name).setValue(value)
      } else {
        if (form.get(name).value == null && value != null) {  // legacy
          form.setControl(name, generateFormFromMetadata(varInfo.metadata(), value, fieldSchema))
        } else if (value == null) {  // legacy
          form.setControl(name, new FormControl(null, fieldSchema.validators))
        } else {
          formAssign(form.get(name) as FormGroup, varInfo.metadata(), value, fieldSchema)
        }
      }
    }
  }
}


export function getValidatorParameter(validators: Array<any>, parameterName: string, defaultValue: any) {
  if (!validators) return defaultValue;
  let res = validators.find(x => x[0] === parameterName);
  if (!res) return defaultValue;
  return res[1];
}

export function idEquals(a: any, b: any) {
  return (a === b) || (a != null && b != null && a.id === b.id);
}

export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function correctRound2(value: number) {
  let numericFix = 0.00000000000001
  return Number((value + numericFix).toFixed(2))
}

export function correctRound4(value: number) {
  let numericFix = 0.00000000000001
  return Number((value + numericFix).toFixed(4))
}

export function correctRound6(value: number) {
  let numericFix = 0.00000000000001
  return Number((value + numericFix).toFixed(6))
}

export function formatBytes(bytes, decimals?) {
  if (bytes == 0) return '0 B';
  const k = 1024,
    dm = decimals || 2,
    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function dateISOString(date: string | Date) {

  // If it's already correct format
  if (typeof date === 'string' && date.split('T').length < 2) {
    return date;
  } else if (date instanceof Date) {
    return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
  } else {
    return null;
  }
}

export function fancyNavigate(route: ActivatedRoute, router: Router, link: string) {
  if (link.startsWith("http://") || link.startsWith("https://") || link.startsWith("mailto:")) {
    window.open(link, "_blank");
  } else if (link.startsWith("#")) {   // lokalna ruta na strani
    let anchor = link.startsWith('#') ? link.substr(1) : link.substr(2);
    if (/\d/.test(anchor)) {
      let n = Number(anchor)
      window.scrollTo({
        top: n,
        left: 0,
        behavior: 'smooth'
      });
    } else {
      let el = document.getElementsByName(anchor)
      if (el && el[0]) {
        el[0].scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  } else if (link.startsWith('/#')) {   // navigacija + fragment
    let anchor = link.substr(2);
    if (route.snapshot.url.length == 0) {    // ali si na landing pagu
      let el = document.getElementsByName(anchor)
      if (el && el[0]) {
        el[0].scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      router.navigate(['/'], { fragment: anchor })
    }
  } else {
    router.navigate([link])
  }
}

export function topInScreen(el) {
  var rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    // rect.left >= 0 &&
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) //&&
    // rect.left <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

export function bottomInScreen(el) {
  var rect = el.getBoundingClientRect();
  return (
    rect.bottom >= 0 &&
    // rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) //&&
    // rect.left <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

export function isElementInViewport(el) {
  var rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}


export function getPath(route: ActivatedRouteSnapshot): string {
  let pathFromParent = route.pathFromRoot.map(x => {
    if (x.url.length > 0) {
      return x.url.map(y => y.path || '').join('/')
    }
    return ''
  }).join('/')
  return pathFromParent
}

// Date and time formatters
export function formatDateWithDots(dateToBeFormatted: string): string {

  // Create date with time in the local system timezone
  const date = new Date(dateToBeFormatted + 'T00:00:00');

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const dt = date.getDate();

  return dt + '.' + month + '.' + year;
}

export function formatDateTimeWithDots(dateTimeToBeFormatted: string): string {

  const date = new Date(dateTimeToBeFormatted);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const dt = date.getDate();

  return dt + '.' + month + '.' + year;
}

export function formatDateWithDotsAtHour(dateTimeToBeFormatted: string) {

  const date = formatDateTimeWithDots(dateTimeToBeFormatted);
  const wholeDate = new Date(dateTimeToBeFormatted);
  const time = wholeDate.getHours() + ':' + wholeDate.getMinutes().toString().padStart(2, '0');
  return $localize`:@@utsil.dateAndTimeFormatter.at:${date} at ${time}`;
}

export function isEmptyDictionary(dict: any) {
  return dict == null || (Object.keys(dict).length === 0 && dict.constructor === Object)
}

export function dbKey(obj: any): string {
  if (obj.dbKey) return obj.dbKey
  if (obj._id) return obj._id
  return null
}

export function camelize(str) {
  if (!str) {
    return str
  }
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}

export function setNavigationParameter(router: Router, route: ActivatedRoute, paramName: string, paramValue: string) {
  let params = { ...route.snapshot.queryParams }
  if (paramValue) {
    params[paramName] = paramValue
  } else {
    delete params[paramName]
  }
  router.navigate([], { relativeTo: route, queryParams: params })
}

export async function setSelectedIdFieldFromQueryParams(component: any, route: ActivatedRoute, field: string, form: FormControl, codebook: GeneralSifrantService<any>, setCallback: (val: any) => void) {
  component[field] = route.snapshot.queryParams[field]
  let entities = await codebook.getAllCandidates().pipe(take(1)).toPromise()
  let res = entities.find(x => dbKey(x) === component[field])
  if (res) {
    form.setValue(res)
    form.updateValueAndValidity()
    setCallback(res)
  }
}

export function deleteNullFields(object: any) {
  Object.keys(object).forEach((key) => (object[key] == null) && delete object[key]);
}
