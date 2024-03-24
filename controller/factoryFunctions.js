
const catchAsync = require('./../utils/catchAsync.js')
const appError = require('./../classController/appError.js')
const ApiFetureds = require('./../classController/apiFetureds.js')
const { populate } = require('../Model/userModel.js')



exports.deleteOne = function (Model) {
    return catchAsync(async function (req, res, next) {
        const doc = await Model.findByIdAndDelete(req.params.id)
        if (!doc) return next(new appError(`no document contains this identification: ${req.params.id}`, 404))
        res.status(200).json({
            status: 'succes',
            messague: "document delete"
        })
    })
}

exports.updateOne = function (Model) {
    return catchAsync(async function (req, res, next) {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
        if (!Model) return next(new appError(`no document contains this identification: ${req.params.id}`, 404))
        res.status(200).json({
            status: 'succes',
            messague: 'updating data....'
        })
    })
}

exports.createOne = function (Model) {
    return catchAsync(async (req, res, next) => {
        const doc = await Model.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                Document: doc
            }
        });
    });
}

exports.getDocuments = function (Model) {

    return catchAsync(async function (req, res, next) {
        let filter = {}
        if (req.params.tourId) filter = { refTour: req.params.tourId }
        const features = new ApiFetureds(Model.find(filter), req.query).filterUrl().sorted().filterDoc().pagination()
        const docs = await features.query

        res.status(200).json({
            status: 'succes',
            documents:docs.lenght,
            data: {
                data: docs
            }
        })
    })
}

exports.getOneDocuemnt = function (Model, populate) {
    return catchAsync(async function (req, res, next) {

        let query = Model.findById(req.params.id)

        if (populate) query = query.populate(populate)

        // para acceder a los para metros de la request se usa req.params, eso dara los valores de los parametros
        const doc = await query

        if (!doc) return next(new appError(`no document contains this identification: ${req.params.id}`, 404))

        res.status(200).json({
            status: 'succes',
            saludo: req.requestSaludo,
            data: {
                data: doc
            }
        })
    })
}