const MetaData = require('../models/metaData');
const CustomError = require('../errorHandlers/customError');

// Generic function to get metadata
const getData = async (req, res, next, dataName) => {
  try {
    const meta = await MetaData.findOne({ dataName });
    if (!meta || !meta.data) {
      return next(new CustomError(`${dataName} not available`, 404));
    }
    res.status(200).json(meta.data);
  } catch (error) {
    next(new CustomError(error.message, 500));
  }
};


// Get pain types
const getPainTypes = (req, res, next) => {
  getData(req, res, next, 'pain_types');
};

// Get injury places
const getInjuryPlaces = (req, res, next) => {
  getData(req, res, next, 'injury_places');
};

module.exports = { getPainTypes, getInjuryPlaces };