const {DataTypes, literal} = require("sequelize");
const connection = require("./connection");

const Account = connection.define("account",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            unique: false,
            autoIncrement: true
        },
        role: {
            type: DataTypes.ENUM("user", "moderator", "teacher", "admin"),
            defaultValue: "user"
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        surname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        nickname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }
);

const Class = connection.define("class",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            unique: false,
            autoIncrement: true
        },
        number: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        char: {
            type: DataTypes.CHAR,
            allowNull: false
        }
    }
);
Account.hasOne(Class);
Class.belongsToMany(Account, {through: "account_class"});

const Achievement = connection.define("achievement",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            unique: false,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        path: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }
);
const AccountAchievement = connection.define("account_achievement",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            unique: false,
            autoIncrement: true
        },
        level: {
            type: DataTypes.INTEGER,
            default: 1
        }
    }
);
Account.hasMany(Achievement);
Achievement.belongsToMany(Account, {through: AccountAchievement})

module.exports = {
    Account,
    Class,
    AccountAchievement
}