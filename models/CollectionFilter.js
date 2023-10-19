import { log } from "../log.js";
export default class CollectionFilter {
  constructor(object, params, model) {
    this.object = object;
    this.params = params;
    this.model = model;
  }



  filterData() {
    log(FgRed, "testUN");
    let filteredData = this.object;
    if (this.params != null) {
      log(FgRed, "testDEUX");
      for (const param in this.params) {
        const paramLower = param.toLowerCase(); // Convert param to lowercase

        let objectKeys = Object.keys(this.object[0]);
        for(let key of objectKeys) {
          if(key in paramLower) {
            let searchString = paramLower[key];
          }

          objectList = objectList.filter((object) => CollectionFilter.valueMatch(object[key], searchString));
        }
        let sort_args = paramLower.sort.split(',');
        let sortType = sort_args[0];
        if (sortType in this.objectList[0]) {
          const filterValue = this.params[param];
          if (filterValue.startsWith('*') && filterValue.endsWith('*')) {
            // Contient "a"
            const searchValue = filterValue.slice(1, -1);
            filteredData = filteredData.filter(item => item.Title.toLowerCase().includes(searchValue.toLowerCase()));
          } else if (filterValue.startsWith('*')) {
            // Termine par "a"
            const searchValue = filterValue.slice(1);
            filteredData = filteredData.filter(item => item.Title.toLowerCase().endsWith(searchValue.toLowerCase()));
          } else if (filterValue.endsWith('*')) {
            // Commence par "a"
            const searchValue = filterValue.slice(0, -1);
            filteredData = filteredData.filter(item => item.Title.toLowerCase().startsWith(searchValue.toLowerCase()));
          } else {
            // Égal à "a"
            filteredData = filteredData.filter(item => item.Title.toLowerCase() === filterValue.toLowerCase());
          }
        } else if (paramLower === 'category') {
          // Filtrer par catégorie
          const filterValue = this.params[param];
          filteredData = filteredData.filter(item => item.Category.toLowerCase() === filterValue.toLowerCase());
        }
      }
    }

    // Mettez à jour this.object avec les données filtrées
    this.object = filteredData;

    return this.object;
  }

  sortData() {
    log(FgRed, "test1");
    if (this.params.sort != null) {
      log(FgRed, "test2");
      const [sortField, sortOrder] = this.params.sort.split(',');
      const order = sortOrder === 'desc' ? -1 : 1;
      log(FgRed, sortField);
      let objectList = this.object;
      if (sortField in objectList[0]) {
        this.object = this.object.sort((a, b) => (a[sortField] < b[sortField] ? -order : order));
      }
    }

    return this.object;
  }

  paginateData() {
    log(FgRed, "test11");
    if (this.params.limit != null && this.params.offset != null) {
      log(FgRed, "test22");
      const limit = parseInt(this.params.limit, 10);
      const offset = parseInt(this.params.offset, 10);
      this.object = this.object.slice(offset, offset + limit);
    }

    return this.object;
  }

  selectFields() {
    log(FgRed, "test1111");
    if (this.params.fields != null) {
      log(FgRed, "test2222");
      const fieldsToSelect = this.params.fields.split(',');
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

    return this.object;
  }

  get() {
    log(FgRed, "TEST");
    this.filterData();
    for (const param in this.params) {
      const paramLower = param.toLowerCase(); // Convert param to lowercase
      if ('sort' in paramLower) {
        this.sortData();
      }
    }

    for (const param in this.params) {
      const paramLower = param.toLowerCase(); // Convert param to lowercase
      if ('limit' in paramLower || 'offset' in paramLower) {
        this.selectFields();
      }
    }
    this.paginateData();

    for (const param in this.params) {
      const paramLower = param.toLowerCase(); // Convert param to lowercase
      if ('field' in paramLower) {
        this.selectFields();
      }
    }
    return this.object;
  }
}