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
        const [sortField, sortOrder] = this.params[param].split(',');
        const order = sortOrder && sortOrder.toLowerCase() === 'desc' ? -1 : 1;
        if (sortField in objectList[0]) {
          this.object = this.object.sort((a, b) => (a[sortField] < b[sortField] ? -order : order));
          this.object = filteredData;
          return this.object;
        }
      }
    }
    this.object = filteredData;

    return this.object;
  }


  sortData() {
    if (this.params.sort != null && this.object && this.object.length > 0) {
      const [sortField, sortOrder] = this.params.sort.split(',');

      const order = sortOrder && sortOrder.toLowerCase() === 'desc' ? -1 : 1;

      log(FgGreen, sortField);
      let objectList = this.object;
      if (sortField in objectList[0]) {
        this.object = this.object.sort((a, b) => (a[sortField] < b[sortField] ? -order : order));
      }
    }

    return this.object;
  }


  paginateData() {
    if (this.params.limit != null && this.params.offset != null && this.object && this.object.length > 0) {
      const limit = parseInt(this.params.limit, 10);
      const offset = parseInt(this.params.offset, 10);
      this.object = this.object.slice(offset, offset + limit);
    }

    return this.object;
  }


  selectFields() {
    if (this.params.field != null && this.object && this.object.length > 0) {
      const fieldsToSelect = this.params.field.split(',');
      const uniqueValues = {};
  
      this.object.forEach(item => {
        fieldsToSelect.forEach(field => {
          if (item[field] !== undefined || item[field] !== null) {
            if (!uniqueValues[field]) {
              uniqueValues[field] = new Set();
            }
            uniqueValues[field].add(item[field]);
          }
        });
      });
  
      const fieldObjects = {};
      fieldsToSelect.forEach(field => {
        fieldObjects[field] = [...uniqueValues[field]].map(value => ({ [field]: value }));
      });
  
      this.object = fieldsToSelect.flatMap(field => fieldObjects[field]);
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
    let nbrParams = Object.keys(this.params).length;

    if (nbrParams == 0) { // Aucun paramètre
      return this.object;
    } else {
      const paramsLower = Object.keys(this.params).map(key => key.toLowerCase());
      log(FgMagenta, paramsLower);
      this.filterData(); // Filtrer

      if (paramsLower.includes('sort')) { // Sort
        this.sortData();
      }

      if (paramsLower.includes('limit') || paramsLower.includes('offset')) { //limit ou offset
        this.paginateData();
      }
      log(FgMagenta, paramsLower);
      if (paramsLower.includes('field')) { // field
        this.selectFields();
      }

      return this.object;
    }
  }
}