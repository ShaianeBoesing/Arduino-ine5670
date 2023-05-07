const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ConnectionTypes = require('./ConnectionTypes');

const arduinoHistorySchema = new Schema(
    { 
        type: {type: String, enum: Object.values(ConnectionTypes), default: ConnectionTypes.GET_STATE},
        value: {type: String}
    },
    { timestamps: true }
);

const ArduinoHistory = mongoose.model("ArduinoHistory", arduinoHistorySchema);

module.exports = ArduinoHistory;