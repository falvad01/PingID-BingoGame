const { DataTypes } = require("sequelize");
const sequelize = require("../connection/DBConnection");
const User = require("./user");

const ExtensionVersion = sequelize.define(
    "ExtensionVersion",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        version: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        filename: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        filepath: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        file_size: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        release_notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        uploaded_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    {
        tableName: "extension_versions",
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    }
);

// Define association
ExtensionVersion.belongsTo(User, {
    foreignKey: 'uploaded_by',
    as: 'uploader'
});

module.exports = ExtensionVersion;
