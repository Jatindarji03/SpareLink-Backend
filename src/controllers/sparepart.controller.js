import SparePart from "../models/sparepart.Models.js";
import SupplierSparePart from "../models/supplierSparePartModel.js";

const addSparePart = async (req, res) => {
    try {

        const { supplierId, name, description, categoryId, specifications, price, brandId, modelId, variant } = req.body;
        const image = req.file?.filename;
        console.log(req.body);

        if (!image) {
            return res.status(400).json({ message: "Image is required" });
        }


        if (!supplierId || !name || !description || !categoryId || !specifications || !price || !brandId || !modelId || !variant) {
            return res.status(400).json({ message: "All fields are required" })
        }

        if (price <= 0) {
            return res.status(400).json({ message: "Price must be greater than 0" });
        }

        const newSparePart = new SparePart({
            supplierId: supplierId,
            name: name,
            image: image,
            description: description,
            categoryId: categoryId,
            specifications: specifications,
            brandId: brandId,
            modelId: modelId,
            variant: variant
        });
        await newSparePart.save();
        const newSupplierSparePart = new SupplierSparePart({
            supplierId: supplierId,
            sparePartId: newSparePart._id,
            price: price
        });
        await newSupplierSparePart.save();
        return res.status(201).json({ message: "Spare Part Added", data: newSparePart });


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getSparePartBySupplierId = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id);
        if (!id) {
            return res.status(400).json({ message: "Supplier Id Is required" });
        }
        const spareParts = await SparePart.find({ supplierId: id }).
            populate('categoryId', 'name') // Get category name
            .populate('brandId', 'name') // Get brand name
            .populate('modelId', 'name') // Get model name
            .lean();
        const price= await SupplierSparePart.find({ supplierId: id ,sparePartId: spareParts}).select('sparePartId price').lean();
        console.log(price);    
        if (spareParts.length == 0) {
            return res.status(404).json({ message: "There is no product" });
        }
        return res.status(200).json({ message: "Product Fetched", data: spareParts });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getSparePart = async (req, res) => {
    try {
        const spareParts = await SparePart.find()
            .populate('categoryId', 'name') // Get category name
            .populate('brandId', 'name') // Get brand name
            .populate('modelId', 'name') // Get model name
            .lean();
        if (spareParts.length == 0) {
            return res.status(404).json({ message: "There is no product" });
        }
        return res.status(200).json({ message: "Product Fetched", data: spareParts });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
const deleteSparePart = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: "Spare Part Id is required" });
        }
        const sparePart = await SparePart.findByIdAndDelete({ _id: id });
        if (!sparePart) {
            return res.status(404).json({ message: "Spare Part Not Found" });
        }
        const supplierSparePart = await SupplierSparePart.deleteOne({ sparePartId: id });
        if (!supplierSparePart) {
            return res.status(404).json({ message: "Spare Part Not Found" });
        }
        return res.status(200).json({ message: "Spare Part Deleted" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
const getSparePartById = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: "Spare Part Id is required" });
        }
        const sparePart = await SparePart.findById(id)
            .populate('categoryId', 'name') // Get category name
            .populate('brandId', 'name') // Get brand name
            .populate('modelId', 'name') // Get model name
            .lean();;
        if (!sparePart) {
            return res.status(404).json({ message: "Unable To Fetch Spare Part" });
        }
        return res.status(200).json({ message: "Spare Part Fetched", data: sparePart });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
const updateSparePart = async (req, res) => {
    try {
        const id = req.params.id;
        const image = req.file?.filename;
        const updatedData = {};
        console.log(req.body);
        const {  name, description, categoryId, specifications, brandId, modelId, variant } = req.body;
        

        const existingSparePart = await SparePart.findById(id);
        if(!existingSparePart){
             return res.status(404).json({ message: "Spare Part Not Found" });
        }
        if(name){
            updatedData.name=name;
        }
        if(image){
            updatedData.image=image;
        }
        if(description){
            updatedData.description=description;
        }
        if(categoryId){
            updatedData.categoryId=categoryId;
        }
        if(specifications){
            updatedData.specifications=specifications;
        }
        if(modelId){
            updatedData.modelId=modelId;
        }
        if(brandId){
            updatedData.brandId=brandId;
        }
        if(variant){
            updatedData.variant=variant
        }
        const updatedSparePart= await SparePart.findByIdAndUpdate(id,updatedData,{new:true,runValidators:true});
        return res.status(201).json({message:"Spare Part Updated",data:updatedSparePart});


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export { addSparePart, getSparePartBySupplierId, updateSparePart, deleteSparePart, getSparePart, getSparePartById };