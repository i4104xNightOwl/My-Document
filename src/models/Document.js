const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

class Document extends Model {}

Document.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Tiêu đề không được để trống'
            },
            len: {
                args: [2, 255],
                msg: 'Tiêu đề phải từ 2 đến 255 ký tự'
            }
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Nội dung không được để trống'
            }
        }
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'categories',
            key: 'id'
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            msg: 'Slug này đã tồn tại'
        },
        validate: {
            notEmpty: {
                msg: 'Slug không được để trống'
            }
        }
    }
}, {
    sequelize,
    modelName: 'Document',
    tableName: 'documents',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['slug']
        }
    ]
});

module.exports = Document; 