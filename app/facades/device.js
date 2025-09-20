// Reference models.
const Device = require('#models/Device');
// JWT facade.
const JWT = require('#facades/jwt.facade');
// Custom error.
const { Err } = require('#factories/errors');
const { issueAccessToken } = require('./jwt.facade');
const jwtFacade = require('./jwt.facade');
const jwtService = require('../services/jwt.service');


module.exports = {
	// Auth:
	createDevice: _createDevice
}

// Auth:
async function _createDevice({ name, serialNumber, qrCode, userId }) {
	try{
		try {
            
            const device = await Device.create({
				name,
				serialNumber,
				qrCode,
                userId : userId
			});
	  
			const result = [
				device
			];
	  		// Send output.
			return Promise.resolve(result);
			
		} catch (error) {
			if (error.name === 'SequelizeUniqueConstraintError') {
				const err = new Err('Device already in use');
				err.name = "DeviceInUse";
				throw err;
			}
		}
		
	}
	catch(error){
		return Promise.reject(error);
	}
}
