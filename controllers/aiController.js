const mongoose = require('mongoose');
const aischema = require('../models/ai');
const category = require('../models/category');

const CreateAI = async (req, res) => {
    const { name, description, tags, link, categoryID } = req.body;
    const image = req.file ? req.file.path : null;
    try {
        const existingAI = await aischema.findOne({ name: name });
        if (existingAI) {
            return res.status(400).json({ Message: "Ai aleardy exist." });
        }
        const newAI = await aischema({
            image,
            name,
            description,
            tags,
            link,
            categoryID
        });
        const saveAI = await newAI.save();
        return res.status(200).json({ CreatedAI: saveAI, Message: "Ai Created successfully." });
    } catch (error) {
        console.log("Create AI error: ", error);
        return res.status(500).json({ Message: "Internal server error." });
    }
};

const EditAI = async (req, res) => {
    const id = req.params.aiid;
    const { name, description, tags, link, categoryID } = req.body;
    const image = req.file ? req.file.path : null;
    try {
        const existingAI = await aischema.findOne({ name, _id: { $ne: id } });
        if (existingAI) {
            return res.status(400).json({ Message: "This AI name aleardy exist." });
        }
        const editAI = {
            image,
            name,
            description,
            tags,
            link,
            categoryID
        };
        if (image) {
            editAI.image = image; // Only update image if provided
        }
        await aischema.findByIdAndUpdate(id, editAI, { new: true });
        return res.status(200).json({ UpdatedAI: editAI, Message: "Category updated successfully." });

    } catch (error) {
        console.log("Edit AI error: ", error);
        return res.status(500).json({ Message: error.message });
    }
};

const DeleteAI = async (req, res) => {
    const id = req.params.aiid;
    try {
        const deleteAI = await aischema.findByIdAndDelete(id);
        if (!deleteAI) {
            return res.status(404).json({ Message: "AI not found." });
        }
        return res.status(200).json({ DeletedAI: deleteAI, Message: "Category deleted successfully." });
    } catch (error) {
        console.log("Delete AI error: ", error);
        return res.status(500).json({ Message: "Internal server error." });
    }
};

// const GetAI = async (req, res) => {
//     const { page = 1, limit = 10 } = req.query;
//     let query = req.query.query;
//     try {
//         const pageNumber = parseInt(page);
//         const limitNumber = parseInt(limit);

//         // Find the AIs with pagination
//         const AIs = await aischema.find().skip((pageNumber - 1) * limitNumber).limit(limitNumber);
//         const totalCount = await aischema.countDocuments();
//         const meta = {
//             totalCount, // Total count of all AI datasets
//             totalPages: Math.ceil(totalCount / limitNumber),  // Calculate total pages
//             currentPage: pageNumber,  // Current page
//             perPage: limitNumber,     // Items per page
//         }
//         res.status(200).json({
//             AIs,
//             meta
//         });
//     } catch (error) {
//         console.log("Get AI error: ", error);
//         return res.status(500).json({ Message: "Internal server error." });
//     }
// }

const GetSingleAI = async (req, res) => {
    const id = req.params.aiid;
    try {
        const ai_tool = await aischema.findById({ _id: id }).populate({ path: 'categoryID', select: 'name' });
        return res.status(200).json({ ai_tool });
    } catch (error) {
        console.log("Single get AI error: ", error);
        return res.status(500).json({ Message: "Internal server error." })
    }
}

// const SearchAI = async (req,res) => {
//     try {
//         let query = req.query.query;
//         console.log(query);
        
//         let page = parseInt(req.query.page) || 1;
//         let limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;

//         if (!query || query.trim() === '') {
//             return res.status(400).json({ message: "Query parameter is required." });
//         }

//         const AIsearch = await aischema.find({
//             $or: [
//                 { name: { $regex: new RegExp(query, 'i') } },  
//                 { tags: { $regex: new RegExp(query, 'i') } }  
//             ]
//         });
        
//         if (AIsearch.length === 0) {
//             return res.status(200).json({ message: "No results found.", data: [] });
//         }
//         const meta = {
//             page: page,
//             limit: limit,
//             totalResults: AIsearch.length,
//             totalPages: Math.ceil((AIsearch.length) / limit)
//         }
//         return res.status(200).json({ message: "Search results", data: AIsearch, meta })

//     } catch (error) {
//         console.log("Search AI error: ", error);
//         return res.status(500).json({ Message: "Internal server error." })
//     }
// }

const GetAI = async (req, res) => {
    const { page = 1, limit = 10, query } = req.query; // Getting page, limit, and query from request params
    try {
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        let AIs = [];
        let totalCount = 0;

        if (query) {
            // Perform search if query is provided
            const AIsearch = await aischema.find({
                $or: [
                    { name: { $regex: new RegExp(query, 'i') } },
                    { tags: { $regex: new RegExp(query, 'i') } }
                ]
            });

            totalCount = AIsearch.length;

            // Pagination for search results
            AIs = AIsearch.slice(skip, skip + limitNumber);

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
            AIs = await aischema.find().skip(skip).limit(limitNumber);
            totalCount = await aischema.countDocuments();
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
            data: AIs,
            meta
        });

    } catch (error) {
        console.log("Get AI error: ", error);
        return res.status(500).json({ Message: "Internal server error." });
    }
};

module.exports = { CreateAI, EditAI, DeleteAI, GetAI, GetSingleAI };