const express = require('express');
const mongoose = require('mongoose');
const categoryModel = require('../models/category');
const aimodel = require('../models/ai');
const models = require('../models/models');
const datasets = require('../models/datasets');

const Search = async (req, res) => {
    try {
        let query = req.query.query;
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;

        if (!query || query.trim() === '') {
            return res.status(400).json({ message: "Query parameter is required." });
        }

        const searchCriteria = {
            $or: [
                { name: { $regex: new RegExp(query, 'i') } },
                { tags: { $regex: new RegExp(query, 'i') } }
            ]
        };

        const skip = (page - 1) * limit;

        const search_all = async () => {
            const ai = await aimodel.find(searchCriteria);
            const model = await models.find(searchCriteria);
            const dataset = await datasets.find(searchCriteria);

            const SearchResult = ai.concat(model, dataset);
            
            if (SearchResult.length === 0) {
                return res.status(404).json({ message: "No results found.", data: [] });
            }

            const meta = {
                page: page,
                limit: limit,
                totalResults: ai.length + model.length + dataset.length,
                totalPages: Math.ceil((ai.length + model.length + dataset.length) / limit)
            }
            return res.status(200).json({ message: "Search results", data: SearchResult, meta })
        }

        await search_all();

    } catch (error) {
        console.log("Search API error: ", error);
        return res.status(500).json({ Message: "Internal server error." });
    }
}

module.exports = { Search };