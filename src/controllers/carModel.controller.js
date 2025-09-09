import CarModel from "../models/carModel.Models.js";

const createCarModel = async (req, res) => {
    try {
        const { carModel, carBrand } = req.body;
        const image = req.file?.filename;

        if (image) {
            req.body.modelImage = image;
        } else {
            return res.status(400).json({ mesaage: "Image is required" });
            req.body.modelImage = null;
        }

        if (!carModel || !carBrand) {
            return res.status(400).json({ message: "Model And Brand is required" });
        }
        //check if the car model is exist or not
        const existingModel = CarModel.findOne({ carModel: carModel });
        if (!existingModel) {
            return res.status(400).json({ message: "Model Already exists" });
        }
        const newModel = new CarModel({
            carModel: carModel,
            carBrand: carBrand,
            carModelImage: req.body.modelImage
        });
        await newModel.save();
        return res.status(200).json({ message: "Car Model data saved", data: newModel });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server Error", error: error });
    }
}

const deleteCarModel = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Car Model is required" });
        }
        await CarModel.findByIdAndDelete(id);
        return res.status(200).json({ mesaage: "Car Model Deleted" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server Error", error: error });
    }
}
const getCarModel = async (req, res) => {
    try {
        const carModels = await CarModel.find();
        if (carModels.length == 0) {
            return res.status(200).json({ mesaage: "There is no car model" });
        }
        return res.status(200).json({ mesaage: "Car Model Data Fetched ", data: carModels });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server Error", error: error });
    }
}
const updateCarModel = async (req, res) => {
    try {
        const { id } = req.params;
        const { carModel, carBrand } = req.body;
        const image = req.file?.filename;
        
        if(!carBrand && !carModel && !image){
            return res.status(400).json({message:"At least one field is required to update"});
        }

        const existingModel = await CarModel.findById(id);
        if(!existingModel){
            return res.status(404).json({message:"Model Not Found"});
        }
        const updateData={};
        if(carModel){
            const carModelExists = await CarModel.findOne({
                carModel:carModel.trim(),
                _id:{$ne:id}
            });
            if (carModelExists) {
                return res.status(400).json({ message: "model name already exists" });
            }
            updateData.carModel=carModel;
        }
        if(carBrand){
            updateData.carBrand=carBrand;
        }
        if(image){
            updateData.carModelImage=image;
        }

       const updatedModel = await CarModel.findByIdAndUpdate(id,updateData,{new:true,runValidators:true});
        return res.status(200).json({
            message: "Model updated successfully",
            data: updatedModel
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server Error", error: error });
    }
};
const getModelByBrand = async (req, res) => {
    try {
        const { brandId } = req.params;
        // console.log(brandId,"is the brandid");
        if (!brandId) {
            const carModels=await CarModel.find();
            if(carModels.length===0){
                return res.status(200).json({ message: "No models found", data: [] });
            }
            return res.status(200).json({data:carModels, message: "Brand Id is required" });
        }
        const carModels = await CarModel.find({ carBrand: brandId });
        if (carModels.length === 0) {
            return res.status(200).json({ message: "No models found for this brand", data: [] });
        }
        return res.status(200).json({ message: "Models fetched successfully", data: carModels });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server Error", error: error });
    }
};

export { createCarModel, deleteCarModel, getCarModel, updateCarModel ,getModelByBrand};