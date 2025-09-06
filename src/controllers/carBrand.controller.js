import CarBrand from "../models/CarBrand.Models.js";

const createBrand = async (req, res) => {
    try {
        const { name } = req.body;
        const image = req.file?.filename;

        if (!image) {
            return res.status(400).json({ message: "Image is required" });
        }

        if (!name) {
            return res.status(400).json({ message: "Brand Name Is Required" });
        }

        const existingBrand = await CarBrand.findOne({ name: name.trim() });
        if (existingBrand) {
            return res.status(400).json({ message: "Brand Already exists" });
        }

        const newBrand = new CarBrand({
            name: name,
            logo: image
        });

        await newBrand.save();
        return res.status(200).json({ message: "Brand Created successfully", data: newBrand });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server Error", error: error });
    }
};

const getBrandDetails = async (req, res) => {
    try {
        const carBrands = await CarBrand.find();
        if (carBrands.length == 0) {
            return res.status(404).json({ mesaage: "There is no brand" });
        }
        return res.status(200).json({ message: "Car Brand Fetched", data: carBrands });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server Error", error: error });
    }
};

const updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body || {};
        const image = req.file?.filename;

        const existingBrand = CarBrand.findById(id);
        if (!existingBrand) {
            return res.status(404).json({ message: "Brand Not Found" });
        }
        const updateData = {};
        if (name) {
            const brandNameExists = await CarBrand.findOne({
                name: name.trim(),
                _id: { $ne: id }
            });

            if (brandNameExists) {
                return res.status(400).json({ message: "Brand name already exists" });
            }
            updateData.name = name.trim();
        }
        if (image) {
            updateData.logo = image;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        const updatedBrand = await CarBrand.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            message: "Brand updated successfully",
            data: updatedBrand
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server Error", error: error });
    }
};

const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Brand Id is required" });
        }
        const deletedBrand = await CarBrand.findByIdAndDelete(id);
        if (!deletedBrand) {
            return res.status(404).json({ message: "Brand Not Found" });
        }
        return res.status(200).json({ message: "Brand Deleted" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server Error", error: error });
    }
};

export { createBrand, getBrandDetails, updateBrand, deleteBrand };