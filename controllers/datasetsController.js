const mongoose = require('mongoose');
const datasets = require('../models/datasets');


const createDataset = async (req, res) => {
    const { name, description, tags, link, categoryID } = req.body;
    const image = req.file ? req.file.path : null;
    try {
        const existingDataset = await datasets.findOne({ name: name });
        if (existingDataset) {
            return res.status(400).json({ Message: "Dataset aleardy exist." });
        }
        const newDataset = await datasets({
            image,
            name,
            description,
            tags,
            link,
            categoryID
        });
        const savedatasets = await newDataset.save();
        return res.status(200).json({ Created_datasets: savedatasets, Message: "Dataset Created successfully." });
    } catch (error) {
        console.log("Create dataset error: ", error);
        return res.status(500).json({ Message: "Internal server error." });
    }
};

const editDataset = async (req, res) => {
    const id = req.params.datasetid;
    const { name, description, tags, link, categoryID } = req.body;
    const image = req.file ? req.file.path : null;
    try {
        const existingDataset = await datasets.findOne({ name, _id: { $ne: id } });
        if (existingDataset) {
            return res.status(400).json({ Message: "This Dataset name aleardy exist." });
        }
        const editdatasets = {
            image,
            name,
            description,
            tags,
            link,
            categoryID
        };
        if (image) {
            editdatasets.image = image; // Only update image if provided
        }
        await datasets.findByIdAndUpdate(id, editdatasets, { new: true });
        return res.status(200).json({ Updated_datasets: editdatasets, Message: "Dataset updated successfully." });

    } catch (error) {
        console.log("Edit dataset error: ", error);
        return res.status(500).json({ Message: "Internal server error." });
    }
};

const DeleteDataset = async (req, res) => {
    const id = req.params.datasetid;
    try {
        const deletedatasets = await datasets.findByIdAndDelete(id);
        if (!deletedatasets) {
            return res.status(404).json({ Message: "Dataset not found." });
        }
        return res.status(200).json({ Deleted_datasets: deletedatasets, Message: "Dataset deleted successfully." });
    } catch (error) {
        console.log("Delete dataset error: ", error);
        return res.status(500).json({ Message: "Internal server error." });
    }
};

// const GetDataset = async (req, res) => {
//     const { page = 1, limit = 10 } = req.query;
//     try {
//         const pageNumber = parseInt(page);
//         const limitNumber = parseInt(limit);
//         
//         const dataset = await datasets.find().skip((pageNumber - 1) * limitNumber).limit(limitNumber);
//         const totalCount = await datasets.countDocuments();
//         const meta = {
//             totalCount, // Total count of all AI datasets
//             totalPages: Math.ceil(totalCount / limitNumber),  // Calculate total pages
//             currentPage: pageNumber,  // Current page
//             perPage: limitNumber,     // Items per page
//         }
//         res.status(200).json({
//             dataset,
//             meta
//         });
//     } catch (error) {
//         console.log("Get dataset error: ", error);
//         return res.status(500).json({ Message: "Internal server error." });
//     }
// };

const GetSingleDataset = async (req, res) => {
    const id = req.params.datasetid;
    try {
        const dataset = await datasets.findById({ _id: id }).populate({ path: 'categoryID', select: 'name' });
        return res.status(200).json({ dataset });
    } catch (error) {
        console.log("Single get datasets error: ", error);
        return res.status(500).json({ Message: "Internal server error." })
    }
}

// const SearchDataset = async (req,res) => {
//     try {
//         let query = req.query.query;
//         let page = parseInt(req.query.page) || 1;
//         let limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;

//         if (!query || query.trim() === '') {
//             return res.status(400).json({ message: "Query parameter is required." });
//         }

//         const DatasetSearch = await datasets.find({
//             $or: [
//                 { name: { $regex: new RegExp(query, 'i') } },  
//                 { tags: { $regex: new RegExp(query, 'i') } }  
//             ]
//         });
        
//         if (DatasetSearch.length === 0) {
//             return res.status(200).json({ message: "No results found.", data: [] });
//         }
//         const meta = {
//             page: page,
//             limit: limit,
//             totalResults: DatasetSearch.length,
//             totalPages: Math.ceil((DatasetSearch.length) / limit)
//         }
//         return res.status(200).json({ message: "Search results", data: DatasetSearch, meta })

//     } catch (error) {
//         console.log("Search Datasets error: ", error);
//         return res.status(500).json({ Message: "Internal server error." })
//     }
// }

const GetDataset = async (req, res) => {
    const { page = 1, limit = 10, query } = req.query; // Getting page, limit, and query from request params
    try {
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        let dataset = [];
        let totalCount = 0;

        if (query) {
            // Perform search if query is provided
            const datasetsearch = await datasets.find({
                $or: [
                    { name: { $regex: new RegExp(query, 'i') } },
                    { tags: { $regex: new RegExp(query, 'i') } }
                ]
            });

            totalCount = datasetsearch.length;

            // Pagination for search results
            dataset = datasetsearch.slice(skip, skip + limitNumber);

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
            dataset = await datasets.find().skip(skip).limit(limitNumber);
            totalCount = await datasets.countDocuments();
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
            message: query ? "Search results" : "Datasets data",
            data: dataset,
            meta
        });

    } catch (error) {
        console.log("Get AI error: ", error);
        return res.status(500).json({ Message: "Internal server error." });
    }
};
module.exports = { createDataset, editDataset, DeleteDataset, GetDataset, GetSingleDataset };