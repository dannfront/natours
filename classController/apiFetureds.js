const { Long } = require("mongodb")

class ApiFetureds {
    constructor(query, UrlContent) {
        this.query = query
        this.UrlContent = UrlContent
    }

    filterUrl() {
        /////////////
        const queryObj = { ...this.UrlContent }
        const filter = ["page", "sort", "limit", "fields", "age"]
        filter.forEach(el => delete queryObj[el])
        ///////
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`)

        this.query.find(JSON.parse(queryStr))
        return this
    }

    sorted() {

        //127.0.0.1:3000/api/v1/tours?sort=-price,-ratingAverage
        this.UrlContent.sort ? this.query = this.query.sort(this.UrlContent.sort.split(",").join(" ")) : this.query = this.query.sort('-price')
        return this
    }

    filterDoc() {
        //127.0.0.1:3000/api/v1/tours?fields=name,summary,description
        this.UrlContent.fields ? this.query = this.query.select(this.UrlContent.fields.split(",").join(" ")) : this.query = this.query.select
        ("-__v")
        return this
    }

    pagination() {
        // pagination
        const page = +this.UrlContent.page || 1;
        const limit = +this.UrlContent.limit || 3;
        const skip = limit * (page - 1);
        this.query = this.query.skip(skip).limit(limit);
        return this
    }

}


module.exports = ApiFetureds