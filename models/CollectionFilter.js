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
  
        // Obtenez la liste des clés (champs) du modèle
        const modelKeys = Object.keys(this.object[0]);
  
        if (modelKeys.includes(paramLower)) {
          const filterValue = this.params[param];
          if (filterValue.startsWith('*') && filterValue.endsWith('*')) {
            // Contient "a"
            const searchValue = filterValue.slice(1, -1);
            filteredData = filteredData.filter(item => item[paramLower].toLowerCase().includes(searchValue.toLowerCase()));
          } else if (filterValue.startsWith('*')) {
            // Termine par "a"
            const searchValue = filterValue.slice(1);
            filteredData = filteredData.filter(item => item[paramLower].toLowerCase().endsWith(searchValue.toLowerCase()));
          } else if (filterValue.endsWith('*')) {
            // Commence par "a"
            const searchValue = filterValue.slice(0, -1);
            filteredData = filteredData.filter(item => item[paramLower].toLowerCase().startsWith(searchValue.toLowerCase()));
          } else {
            // Égal à "a"
            filteredData = filteredData.filter(item => item[paramLower].toLowerCase() === filterValue.toLowerCase());
          }
        } else if (param === 'Category') {
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
    log(FgRed, "test11");
    if (this.params != null) {
      const sortKey = Object.keys(this.params).find(key => key.toLowerCase() === 'sort');
      if (sortKey) {
        log(FgRed, "test22");
        const sortObject = this.params[sortKey].toLowerCase();
        const [sortField, sortOrder] = sortObject.split(',');

        // Vérifiez d'abord si sortOrder existe, puis convertissez en minuscules
        const order = sortOrder && sortOrder.toLowerCase() === 'desc' ? -1 : 1;

        log(FgRed, sortField);
        const objectList = this.object;
        if (sortField in objectList[0]) {
          this.object = this.object.sort((a, b) => (a[sortField] < b[sortField] ? -order : order));
        }
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
    if (this.params.field != null) {
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

  get() {
    log(FgMagenta, "GET");
    const paramsLower = Object.keys(this.params).map(key => key.toLowerCase());

    this.filterData();

    if (paramsLower.includes('sort')) {
      log(FgMagenta, "NORMAL");
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