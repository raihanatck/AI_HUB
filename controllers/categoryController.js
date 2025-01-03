const mongoose = require('mongoose');
const categoryModel = require('../models/category');
const aimodel = require('../models/ai');
const models = require('../models/models');
const datasets = require('../models/datasets');

const CreateCategory = async (req, res) => {
    const { name, description } = req.body;
    try {
        const existingcategory = await categoryModel.findOne({ name: name });
        if (existingcategory) {
            return res.status(400).json({ Message: "Category is already exist." });
        }
        if (!name) {
            return res.status(400).json({ Message: "Category name is required" });
        }
        if (!description) {
            return res.status(400).json({ Message: "Category description is required" });
        }
        const newCategory = await categoryModel({
            name,
            description
        });
        const saveCategory = await newCategory.save();
        return res.status(200).json({ Category: saveCategory, Message: "Category created successfully." });
    } catch (error) {
        console.log("Create category error: ", error);
        return res.status(500).json({ Message: "Internal server error." });
    }
};

const EditCategory = async (req, res) => {
    const id = req.params.categoryid;
    const { name, description } = req.body;
    try {
        const existingcategory = await categoryModel.findOne({ name: name });
        if (existingcategory) {
            return res.status(400).json({ Message: "Category is already exist." });
        }
        if (!name) {
            return res.status(400).json({ Message: "Category name is required" });
        }
        if (!description) {
            return res.status(400).json({ Message: "Category description is required" });
        }
        const editCategory = {
            name,
            description
        };
        await categoryModel.findByIdAndUpdate(id, editCategory, { new: true });
        return res.status(200).json({ editCategory, Message: "Category updated successfully." });

    } catch (error) {
        console.log("Edit category error: ", error);
        return res.status(500).json({ Message: "Internal server error." });
    }
};

const DeleteCategory = async (req, res) => {
    const id = req.params.categoryid;
    try {
        const delcategory = await categoryModel.findByIdAndDelete(id);
        return res.status(200).json({ delcategory, Message: "Category deleted successfully." });
    } catch (error) {
        console.log("Delete category error: ", error);
        return res.status(500).json({ Message: "Internal server error." });
    }
};

const GetCategory = async (req, res) => {
    try {
        const category = await categoryModel.find({}, 'id name description');
        const categories = await Promise.all(category.map(async (category) => {

            const toolsCount = await aimodel.countDocuments({ categoryID: category._id });
            const modelsCount = await models.countDocuments({ categoryID: category._id });
            const datasetCount = await datasets.countDocuments({ categoryID: category._id });
            const AIs = await aimodel.find({ categoryID: category._id })
            const Models = await models.find({ categoryID: category._id })
            const DataSets = await datasets.find({ categoryID: category._id })

            return {
                total_tools: toolsCount,
                total_models: modelsCount,
                total_datasets: datasetCount,
                tools: AIs,
                models: Models,
                datasets: DataSets,
                id: category.id,
                name: category.name,
                description: category.description,
            };
        }));
        return res.status(200).json({ categories });
    } catch (error) {
        console.log("Delete category error: ", error);
        return res.status(500).json({ Message: "Internal server error." });
    }
}

const GetSingleCategory = async (req, res) => {
    const id = req.params.categoryid;
    try {
        const category = await categoryModel.findById({ _id: id }).populate({ path: 'categoryID', select: 'name' });
        return res.status(200).json({ category });
    } catch (error) {
        console.log("Single get category error: ", error);
        return res.status(500).json({ Message: "Internal server error." })
    }
}
module.exports = { CreateCategory, EditCategory, DeleteCategory, GetCategory, GetSingleCategory };