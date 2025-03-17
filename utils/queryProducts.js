class queryProducts {
    products = [];
    query = {};
    constructor(products, query) {
      this.products = products;
      this.query = query;
    }
    queryCategory = () => {
      this.products = this.query.category
        ? this.products.filter((c) => c.category === this.query.category)
        : this.products;
      return this;
    };
    queryRating = () => {
      this.products = this.query.rating
        ? this.products.filter(
            (c) =>
              parseInt(this.query.rating) <= c.rating &&
              c.rating < parseInt(this.query.rating) + 1
          )
        : this.products;
      return this;
    };
    querySearch = () => {
      this.products = this.query.searchValue
        ? this.products.filter(
            (p) =>
              p.name.toUpperCase().indexOf(this.query.searchValue.toUpperCase()) >
              -1
          )
        : this.products;
      return this;
    };
    queryPrice = () => {
      this.products = this.products.filter(
        (p) => p.price >= this.query.lowPrice && p.price <= this.query.highPrice
      );
      return this;
    };
    querySortPrice = () => {
      if (this.query.sort) {
        if (this.query.sort === "low-to-high") {
          this.products = this.products.sort(function (a, b) {
            return a.price - b.price;
          });
        } else {
          this.products = this.products.sort(function (a, b) {
            return b.price - a.price;
          });
        }
      }
      return this;
    };
    paginate = () => {
      let { currentPage } = this.query;
      const limit = (parseInt(currentPage) - 1) * this.query.parPage;
      let skip = [];
  
      for (let i = limit; i < this.products.length; i++) {
        skip.push(this.products[i]);
      }
      this.products = skip;
      return this;
    };
    limitField = () => {
      let temp = [];
      if (this.products.length > this.query.parPage) {
        for (let i = 0; i < this.query.parPage; i++) {
          temp.push(this.products[i]);
        }
      } else {
        temp = this.products;
      }
      this.products = temp;
      return this;
    };
    getProducts = () => {
      return this.products;
    };
    getProductsCount = () => {
      return this.products.length;
    };
  }
  
  module.exports = queryProducts;
  