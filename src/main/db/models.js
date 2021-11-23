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
        },
        money: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        like_money: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
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
        char: {
            type: DataTypes.CHAR,
            allowNull: false
        },
        act: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }
);
Account.hasOne(Class);
Class.belongsToMany(Account);

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
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        design_path: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }
);
Account.hasMany(Achievement);
Achievement.belongsToMany(Account, {through: "account_achievement"});

const Charter = connection.define("module",
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
        rank_number_max: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        progress_max: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        }
    }
);

const Module = connection.define("module",
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
        }
    }
);
Charter.hasMany(Module);
Module.belongsTo(Charter);

const Theme = connection.define("theme",
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
        }
    }
);
Module.hasMany(Theme);
Theme.belongsToMany(Module);

const AccountLvlCharter = connection.define("theme",
    {
        progress_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        rank_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }
);
Account.hasOne(AccountLvlCharter);
AccountLvlCharter.belongsToMany(Account);

const Message = connection.define("theme",
    {
        text: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        rank_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }
);

module.exports = {
    Account,
    Class,
    Theme,
    Module,
    Charter,
    AccountLvlCharter,
    Message
}