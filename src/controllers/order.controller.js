import Order from "../models/order.Models.js";
import Quotation from "../models/quotationModel.js";

const createOrder = async (req, res) => {
    try {
        const { personalDetails, address, mechanicId, supplierId, quotationId } = req.body;
        if (!personalDetails || !address || !mechanicId || !supplierId || !quotationId) {
            return res.status(400).json({ message: "All Filed is required" });
        }
        const newOrder = new Order({
            personalDetails: personalDetails,
            address: address,
            mechanicId: mechanicId,
            supplierId: supplierId,
            quotationId: quotationId
        });
        await newOrder.save();
        // 2️⃣ Update quotation status to "Payment"
        const updatedQuotation = await Quotation.findByIdAndUpdate(
            quotationId,
            { status: "payment" },   // update only the status
            { new: true }
        );

        if (!updatedQuotation) {
            return res.status(404).json({ message: "Quotation not found" });
        }
        return res.status(201).json({ message: 'Order Created', data: newOrder });
    } catch (error) {
        console.log(`error ${error}`);
        return res.status(500).json({ message: 'Internal Server Error', error: error });
    }
};

const getOrder = async (req, res) => {
    try {
        const id = req.user.id;
        const role = req.user.roleName;
        if (!id || !role) {
            return res.status(400).json({ message: "Id and Role is required" });
        }
        let orders;
        if (role == 'mechanic') {
            orders = await Order.find({ mechanicId: id })
                .populate({
                    path: "quotationId",
                    populate: {
                        path: "product.sparePartId",
                        model: "SparePart",
                        select: "name image description" // only fetch fields you need
                    }
                });
        } else if (role == 'supplier') {
            orders = await Order.find({ supplierId: id })
                .populate({
                    path: "quotationId",
                    populate: {
                        path: "product.sparePartId",
                        model: "SparePart",
                        select: "name" // only fetch fields you need
                    }
                });
        } else {
            return res.status(400).json({ message: "Invalid role" });
        }
        return res.status(200).json({ message: "Order Fetched ", data: orders })
    } catch (error) {
        console.log(`Internal Server Error ${error}`);
        return res.status(500).json({ message: "Internal Server Error", error: error });
    }
}

export { createOrder, getOrder };