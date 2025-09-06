import Category from "../models/categoryModel.js";

const createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Category is required" });
        }

        const newCategory = new Category({ name: name.trim() });
        await newCategory.save();
        return res.status(201).json({ message: "category created", data: newCategory });
    } catch (error) {
        console.log("Error :", error);
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Category Already Exists",
                field: Object.keys(error.keyPattern)[0],
                value: error.keyValue
            })
        }
        return res.status(500).json({ message: "Error", error: error.message })
    }
};

const getCategory = async (req, res) => {
    try {
        const categories = await Category.find();
        if (categories.length == 0) {
            return res.status(404).json({ message: "There is no category" })
        }
        return res.status(200).json({ message: "Category Fetched successfully", data: categories });
    } catch (error) {
        return res.status(500).json({ message: "Error", error: error.message })
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!id) {
            return res.status(400).json({ message: "Category ID is Required" });
        }
        if (!name) {
            return res.status(400).json({ message: "Category Name Is Required" });
        }
        // Check if category exists before updating
        const existingCategory = await Category.findById(id);
        if (!existingCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        // Check for duplicate category name (excluding current category)
        const duplicateCategory = await Category.findOne({
            name: name.trim(),
            _id: { $ne: id }
        });
        if (duplicateCategory) {
            return res.status(400).json({ message: "Category name already exists" });
        }

        const category = await Category.findByIdAndUpdate(id, { name: name.trim() }, { new: true });
        if (!category) {
            return res.status(404).json({ message: "Category Not Exist" });
        }
        return res.status(200).json({ message: "category updated", data: category });
    } catch (error) {
        console.log(`error ${error}`);
        return res.status(500).json({ message: "Error", error: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Category Id Is Required" });
        }
       const deletedCategory= await Category.findByIdAndDelete(id);
       if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        return res.status(200).json({ message: "Category is deleted" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server error", error: error.message });
    }
};

export { createCategory, getCategory, updateCategory, deleteCategory };