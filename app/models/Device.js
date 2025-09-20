// ORM:
const { DataTypes } = require('sequelize');
const database = require('#services/db.service');

const Device = database.define(
	'Device',
	{
		name: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		serialNumber: {
			type: DataTypes.STRING(255),
			allowNull: false
		},

		qrCode: {
			type: DataTypes.STRING(80),
			allowNull: true
		}
	},
	{
		// Enable automatic 'createdAt' and 'updatedAt' fields.
		timestamps: true,
		// Only allow 'soft delete'
		// (set of 'deletedAt' field, insted of the real deletion).
		paranoid: true
	}
);

Device.HavesameSerialNumber = function(serialNumber, userId) {
	return this.findOne({ where: { serialNumber, userId } });
}

Device.GetAllDevices = function() {
	return this.findAll();
}

Device.findById = function(id) {
	return this.findByPk(id);
}

Device.associate = (models) => {
	Device.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
}

// Instance methods:
Device.prototype.toJSON = function() {
	const values = { ...this.get() };
	return values;
}
// Instance methods\

module.exports = Device;
