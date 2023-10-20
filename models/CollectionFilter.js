import { log } from "../log.js";
export default class CollectionFilter {
  constructor(object, params, model) {
    this.object = object;
    this.params = params;
    this.model = model;
  }


  filterData() {
    let filteredData = this.object;
    if (this.params != null) {
      for (const param in this.params) {
        const paramLower = param.toLowerCase(); // Convert param to lowercase
        let objectList = this.object;
        let objectKeys = Object.keys(objectList[0]);
        for (let key of objectKeys) {
          if (paramLower === key.toLowerCase()) {
            let searchString = this.params[param].toLowerCase();
            filteredData = filteredData.filter((object) => this.valueMatch(object[key], searchString));
          }
        }
        /*if (paramLower === 'sort') {
          // Gérer la logique de tri*/
          //let sort_args = this.params[param].split(',');
          const [sortField, sortOrder] =  this.params[param].split(',');
          //let sortField = sort_args[0];
          const order = sortOrder && sortOrder.toLowerCase() === 'desc' ? -1 : 1;
          if (sortField in objectList[0]) {
            this.object = this.object.sort((a, b) => (a[sortField] < b[sortField] ? -order : order));
            log(FgRed, "TEST");
            this.object = filteredData;
            return this.object;
          }
        //}
      }
    }
    // Mettez à jour this.object avec les données filtrées
    this.object = filteredData;
  
    return this.object;
  }


  sortData() {
    if (this.params.sort != null && this.object && this.object.length > 0) {
      const [sortField, sortOrder] = this.params.sort.split(',');
      
      // Vérifiez d'abord si sortOrder existe, puis convertissez en minuscules
      const order = sortOrder && sortOrder.toLowerCase() === 'desc' ? -1 : 1;
      
      log(FgRed, sortField);
      let objectList = this.object;
      if (sortField in objectList[0]) {
        this.object = this.object.sort((a, b) => (a[sortField] < b[sortField] ? -order : order));
      }
    }
  
    return this.object;
  }
  

  paginateData() {
    if (this.params.limit != null && this.params.offset != null) {
      const limit = parseInt(this.params.limit, 10);
      const offset = parseInt(this.params.offset, 10);
      this.object = this.object.slice(offset, offset + limit);
    }

    return this.object;
  }

  selectFields() {
    if (this.params.field != null && this.object && this.object.length > 0) {
      const fieldsToSelect = this.params.field.split(',');
  
      if (fieldsToSelect.includes('Category')) {
        // Vérifiez si 'Category' est inclus dans les champs sélectionnés
        const categories = this.object.map(item => item.Category);
        const uniqueCategories = [...new Set(categories)];
  
        this.object = uniqueCategories.map(category => ({ Category: category }));
      } else {
        this.object = this.object.map(item => {
          const selectedFields = {};
          fieldsToSelect.forEach(field => {
            if (item[field] !== undefined) {
              selectedFields[field] = item[field];
            }
          });
          return selectedFields;
        });
      }
    }
  
    return this.object;
  }

  valueMatch(value, searchValue) {
    try {
      let exp = '^' + searchValue.toLowerCase().replace(/\*/g, '.*') + '$';
      return new RegExp(exp).test(value.toString().toLowerCase());
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  compareNum(x, y) {
    if (x === y) return 0;
    else if (x < y) return -1;
    return 1;
  }
  innerCompare(x, y) {
    if ((typeof x) === 'string')
    return x.localeCompare(y);
    else
    return this.compareNum(x, y);
  }

  get() {
    log(FgMagenta, "GET");
    const paramsLower = Object.keys(this.params).map(key => key.toLowerCase());
    log(FgMagenta, paramsLower);
    this.filterData();

    if (paramsLower.includes('sort')) {
      this.sortData();
    }

    if (paramsLower.includes('limit') || paramsLower.includes('offset')) {
      this.paginateData();
    }

    if (paramsLower.includes('field')) {
      this.selectFields();
    }

    return this.object;
    
  }
  
  
  
}