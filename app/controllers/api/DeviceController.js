// Facades:
const devicesFacade = require('#facades/device');
const jwtFacade = require('#facades/jwt.facade');
const Device = require('#models/Device');
// JWT Service.
const JWT = require('#services/jwt.service');
// Reponse protocols.
const { 
	createOKResponse,
	createErrorResponse
} = require('#factories/responses/api');
// Custom error.
const { Err } = require('#factories/errors');
const jwtService = require('../../services/jwt.service');


module.exports = DeviceController;

function DeviceController() {

	const _processError = (error, req, res) => {
		// Default error message.
		let errorMessage = error?.message ?? 'Internal server error';
		// Default HTTP status code.
		let statusCode = 500;

		switch(error.name) {
			case('Unauthorized'):
				errorMessage = 'Email or password are incorrect.';
				statusCode = 406;
				break;
			case('ValidationError'):
				errorMessage = "Invalid email OR password input";
				statusCode = 401;
				break;
			case('InvalidToken'):
				errorMessage = 'Invalid token or token expired';
				statusCode = 401;
				break;
			case('UserNotFound'):
				errorMessage = "Such user doesn't exist";
				statusCode = 400;
				break;
		    case('AlreadyDevice'):
				errorMessage = "Device Already Exist";
				statusCode = 400;
				break;
				

			// Perform your custom processing here...

			default:
				break;
		}

		// Send error response with provided status code.
		return createErrorResponse({
			res, 
			error: {
				message: errorMessage
			},
			status: statusCode
		});
	}

	// Auth:
	const _createDevice = async (req, res) => {
		try {
			// Extract request input:
			const name = req.body?.name
			const serialNumber = req.body?.serialNumber
			const qrCode = req.body?.qrCode
			const userId = req.token?.id;

			if (!userId) {
			throw new Err('Unauthorized: user id not found in token');
			}
			
			const sameSerials = await Device.HavesameSerialNumber(serialNumber, userId);

			if (sameSerials) {
				const err = new Err('Device already in use');
				err.name = "AlreadyDevice";
				throw err;
			}

			// Create new one.
			const [device] = await devicesFacade.createDevice({
				name,
				serialNumber,
				qrCode,
				userId
			});


			// Everything's fine, send response.
			return createOKResponse({
				res, 
				content:{
					device: device.toJSON()
				}
			});
		}
		catch(error) {
			console.error("DeviceController._create error: ", error);
			return _processError(error, req, res);
		}
	}

    const _getAllDevices = async (req, res) => {

		try {
			const allDevices = await Device.GetAllDevices();
			return createOKResponse({
				res, 
				content:{
					device: allDevices
				}
			});
		}
		catch(error) {
			console.error("DeviceController._create error: ", error);
			return _processError(error, req, res);
		}
	} 

	const _validate = async (req, res) => {
		try {
			const { token } = req.body;

			// Validate token against local seed.
			await JWT.verifyAccessToken(token);

			// Everything's fine, send response.
			return createOKResponse({
				res,
				content:{
					isValid: true,
					message: "Valid Token"
				}
			});
		}
		catch(error) {
			console.error("DeviceController._validate error: ", error);

			// In any error case, we send token not valid:
			// Create custom error with name InvalidToken.
			const err = new Error('Invalid Token!');
			err.name = "InvalidToken";
			return _processError(err, req, res);
		}
	}

	const _refresh = async (req, res) => {
		try {
			// Unwrap refresh token.
			const refreshToken = req?.refreshToken;
			if (!refreshToken){
				const err = new Err("No refreshToken found");
				err.name = "Unauthorized";
				err.status = 401;
				throw err;
			}

			// Everything's ok, issue new one.
			const [ accessToken ] = await jwtFacade.refreshAccessToken({ refreshToken });

			return createOKResponse({
				res,
				content:{ 
					token: accessToken 
				}
			});
		}
		catch(error) {
			console.error("DeviceController._refresh error: ", error);

			// In any error case, we send token not valid:
			// Create custom error with name InvalidToken.
			const err = new Error('Invalid Token!');
			err.name = "InvalidToken";
			return _processError(err, req, res);
		}
	}

	
	return {
		createDevice: _createDevice,
        validate: _validate,
        refresh: _refresh,
        getAllDevices : _getAllDevices
	}
}
