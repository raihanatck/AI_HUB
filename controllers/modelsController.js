const mongoose = require('mongoose');
const models = require('../models/models');


const createModel = async (req, res) => {
    const { name, description, tags, link, categoryID } = req.body;
    const image = req.file ? req.file.path : null;
    try {
        const existingModel = await models.findOne({ name: name });
        if (existingModel) {
            return res.status(400).json({ Message: "Ai aleardy exist." });
        }
        const newModel = await models({
            image,
            name,
            description,
            tags,
            link,
            categoryID
        });
        const saveModel = await newModel.save();
        return res.status(200).json({ CreatedModel: saveModel, Message: "Model Created successfully." });
    } catch (error) {
        console.log("Create model error: ", error);
        return res.status(500).json({ Message: "Internal server error." });
    }
};

const editModel = async (req, res) => {
    const id = req.params.modelid;
    const { name, description, tags, link, categoryID } = req.body;
    const image = req.file ? req.file.path : null;
    try {
        const existingModel = await models.findOne({ name, _id: { $ne: id } });
        if (existingModel) {
            return res.status(400).json({ Message: "This model name aleardy exist." });
        }
        const editmodel = {
            image,
            name,
            description,
            tags,
            link,
            categoryID
        };
        if (image) {
            editmodel.image = image; // Only update image if provided
        }
        await models.findByIdAndUpdate(id, editmodel, { new: true });
        return res.status(200).json({ UpdatedModel: editmodel, Message: "Model updated successfully." });

    } catch (error) {
        console.log("Edit model error: ", error);
        return res.status(500).json({ Message: "Internal server error." });
    }
};

const DeleteModel = async (req, res) => {
    const id = req.params.modelid;
    try {
        const deleteModel = await models.findByIdAndDelete(id);
        if (!deleteModel) {
            return res.status(404).json({ Message: "Model not found." });
        }
        return res.status(200).json({ DeletedModel: deleteModel, Message: "Model deleted successfully." });
    } catch (error) {
        console.log("Delete model error: ", error);
        return res.status(500).json({ Message: "Internal server error." });
    }
};

// const GetModel = async (req, res) => {
//     const { page = 1, limit = 10 } = req.query;
//     try {
//         const pageNumber = parseInt(page);
//         const limitNumber = parseInt(limit);

//         // Find the AIs with pagination
//         const model = await models.find().skip((pageNumber - 1) * limitNumber).limit(limitNumber);
//         const totalCount = await models.countDocuments();
//         const meta = {
//             totalCount, // Total count of all AI datasets
//             totalPages: Math.ceil(totalCount / limitNumber),  // Calculate total pages
//             currentPage: pageNumber,  // Current page
//             perPage: limitNumber,     // Items per page
//         }
//         res.status(200).json({
//             model,
//             meta
//         });
//     } catch (error) {
//         console.log("Get model error: ", error);
//         return res.status(500).json({ Message: "Internal server error." });
//     }
// };

const GetSingleModel = async (req, res) => {
    const id = req.params.modelid;
    try {
        const model = await models.findById({ _id: id }).populate({ path: 'categoryID', select: 'name' });
        return res.status(200).json({ model });
    } catch (error) {
        console.log("Single get models error: ", error);
        return res.status(500).json({ Message: "Internal server error." })
    }
}

// const SearchModel = async (req,res) => {
//     try {
//         let query = req.query.query;
//         let page = parseInt(req.query.page) || 1;
//         let limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;

//         if (!query || query.trim() === '') {
//             return res.status(400).json({ message: "Query parameter is required." });
//         }

//         const ModelSearch = await models.find({
//             $or: [
//                 { name: { $regex: new RegExp(query, 'i') } },  
//                 { tags: { $regex: new RegExp(query, 'i') } }  
//             ]
//         });
        
//         if (ModelSearch.length === 0) {
//             return res.status(200).json({ message: "No results found.", data: [] });
//         }
//         const meta = {
//             page: page,
//             limit: limit,
//             totalResults: ModelSearch.length,
//             totalPages: Math.ceil((ModelSearch.length) / limit)
//         }
//         return res.status(200).json({ message: "Search results", data: ModelSearch, meta })

//     } catch (error) {
//         console.log("Search models error: ", error);
//         return res.status(500).json({ Message: "Internal server error." })
//     }
// }

const GetModel = async (req, res) => {
    const { page = 1, limit = 10, query } = req.query; // Getting page, limit, and query from request params
    try {
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        let Models = [];
        let totalCount = 0;

        if (query) {
            // Perform search if query is provided
            const AIsearch = await models.find({
                $or: [
                    { name: { $regex: new RegExp(query, 'i') } },
                    { tags: { $regex: new RegExp(query, 'i') } }
                ]
            });

            totalCount = AIsearch.length;

            // Pagination for search results
            Models = AIsearch.slice(skip, skip + limitNumber);

            if (totalCount === 0) {
                return res.status(200).json({
                    message: "No results found.",
                    data: [],
                    meta: {
                        page: pageNumber,
                        limit: limitNumber,
                        totalResults: 0,
                        totalPages: 0
                    }
                });
            }

        } else {
            // Find all AIs if no query is provided
            Models = await models.find().skip(skip).limit(limitNumber);
            totalCount = await models.countDocuments();
        }

        // Calculate pagination metadata
        const meta = {
            page: pageNumber,
            limit: limitNumber,
            totalResults: totalCount,
            totalPages: Math.ceil(totalCount / limitNumber)
        };

        // Return the response
        return res.status(200).json({
            message: query ? "Search results" : "AI data",
            data: Models,
            meta
        });

    } catch (error) {
        console.log("Get AI error: ", error);
        return res.status(500).json({ Message: "Internal server error." });
    }
};

module.exports = { createModel, editModel, DeleteModel, GetModel, GetSingleModel};