import SparePart from "../models/sparepart.Models.js";
import SupplierSparePart from "../models/supplierSparePartModel.js";

// ✅ Add Spare Part
const addSparePart = async (req, res) => {
  try {
    const { supplierId, name, description, categoryId, specifications, price, brandId, modelId, variant } = req.body;
    const image = req.file?.filename;

    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    if (!supplierId || !name || !description || !categoryId || !specifications || !price || !brandId || !modelId || !variant) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (price <= 0) {
      return res.status(400).json({ message: "Price must be greater than 0" });
    }

    const newSparePart = new SparePart({
      supplierId,
      name,
      image,
      description,
      categoryId,
      specifications,
      brandId,
      modelId,
      variant
    });
    await newSparePart.save();

    const newSupplierSparePart = new SupplierSparePart({
      supplierId,
      sparePartId: newSparePart._id,
      price
    });
    await newSupplierSparePart.save();

    return res.status(201).json({ message: "Spare Part Added", data: { ...newSparePart.toObject(), price } });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get Spare Parts by Supplier
const getSparePartBySupplierId = async (req, res) => {
  try {
    const supplierId = req.params.id;
    if (!supplierId) {
      return res.status(400).json({ message: "Supplier Id is required" });
    }

    // Get spare parts with details
    const spareParts = await SparePart.find({ supplierId })
      .populate("categoryId", "name")
      .populate("brandId", "name")
      .populate("modelId", "name")
      .lean();

    if (!spareParts.length) {
      return res.status(404).json({ message: "No products found" });
    }

    // Get prices for supplier
    const prices = await SupplierSparePart.find({ supplierId })
      .select("sparePartId price")
      .lean();

    // Attach prices to spareParts
    const partsWithPrice = spareParts.map((part) => {
      const priceObj = prices.find((p) => String(p.sparePartId) === String(part._id));
      return { ...part, price: priceObj ? priceObj.price : null };
    });

    return res.status(200).json({ message: "Products fetched", data: partsWithPrice });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get All Spare Parts
const getSparePart = async (req, res) => {
  try {
    const spareParts = await SparePart.find()
      .populate("categoryId", "name")
      .populate("brandId", "_id name")
      .populate("modelId", "_id carModel") // corrected to name
      .lean();

    if (!spareParts.length) {
      return res.status(404).json({ message: "No products found" });
    }

    // Attach prices (from SupplierSparePart)
    const prices = await SupplierSparePart.find().select("sparePartId price").lean();

    const partsWithPrice = spareParts.map((part) => {
      const priceObj = prices.find((p) => String(p.sparePartId) === String(part._id));
      return { ...part, price: priceObj ? priceObj.price : null };
    });

    return res.status(200).json({ message: "Products fetched", data: partsWithPrice });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get Spare Part by Id
const getSparePartById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Spare Part Id is required" });
    }

    const sparePart = await SparePart.findById(id)
      .populate("categoryId", "name")
      .populate("brandId", "name")
      .populate("modelId", "carModel")
      .lean();

    if (!sparePart) {
      return res.status(404).json({ message: "Unable to fetch spare part" });
    }

    const supplierPart = await SupplierSparePart.findOne({ sparePartId: id }).lean();
    const data = { ...sparePart, price: supplierPart ? supplierPart.price : null };

    return res.status(200).json({ message: "Spare Part Fetched", data });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Update Spare Part
const updateSparePart = async (req, res) => {
  try {
    const id = req.params.id;
    const image = req.file?.filename;

    const { name, description, categoryId, specifications, brandId, modelId, variant, price } = req.body;

    const existingSparePart = await SparePart.findById(id);
    if (!existingSparePart) {
      return res.status(404).json({ message: "Spare Part Not Found" });
    }

    const updatedData = {};
    if (name) updatedData.name = name;
    if (image) updatedData.image = image;
    if (description) updatedData.description = description;
    if (categoryId) updatedData.categoryId = categoryId;
    if (specifications) updatedData.specifications = specifications;
    if (brandId) updatedData.brandId = brandId;
    if (modelId) updatedData.modelId = modelId;
    if (variant) updatedData.variant = variant;

    const updatedSparePart = await SparePart.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    // Update Supplier price separately
    if (price) {
      await SupplierSparePart.findOneAndUpdate(
        { sparePartId: id },
        { price },
        { new: true, upsert: true }
      );
    }

    return res.status(200).json({ message: "Spare Part Updated", data: updatedSparePart });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Delete Spare Part
const deleteSparePart = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Spare Part Id is required" });
    }

    const sparePart = await SparePart.findByIdAndDelete(id);
    if (!sparePart) {
      return res.status(404).json({ message: "Spare Part Not Found" });
    }

    await SupplierSparePart.deleteOne({ sparePartId: id });

    return res.status(200).json({ message: "Spare Part Deleted" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  addSparePart,
  getSparePartBySupplierId,
  updateSparePart,
  deleteSparePart,
  getSparePart,
  getSparePartById
};
