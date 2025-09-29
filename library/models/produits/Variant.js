"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariantModel = void 0;
const mongoose_1 = require("mongoose");
const VariantSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    sku: { type: String, required: true },
    rebuy: { type: Boolean, required: false, default: false },
    rebuyLater: { type: Boolean, required: false, default: false },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number, required: false },
    barcode: { type: String, required: false },
    ids: {
        type: [
            new mongoose_1.Schema({
                shop: { type: String, required: true },
                idProduct: { type: String, required: true },
                idVariant: { type: String, required: true },
            }, { _id: false }),
        ],
        required: true,
    },
}, {
    versionKey: false,
    timestamps: true,
});
exports.VariantModel = mongoose_1.models.variant || (0, mongoose_1.model)("variant", VariantSchema);
