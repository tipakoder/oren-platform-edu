const {DataTypes, literal} = require("sequelize");
const connection = require("./connection");

const Role = connection.define("role",
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

const Account = connection.define("account",
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
Role.hasOne(Account);

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
Class.hasOne(Account);

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

const Charter = connection.define("charter",
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

const AccountAchievement = connection.define("account_achievement", {
    account_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Account,
            key: 'id'
        }
    },
    charter_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Charter,
            key: 'id'
        }
    },
    achievement_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Achievement,
            key: 'id'
        }
    }
});
Account.hasMany(Achievement);
Achievement.belongsToMany(Account, {through: AccountAchievement});

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

const AccountTheme = connection.define("account_theme",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            unique: false,
            autoIncrement: true
        },
        current_count: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        wrong_count: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }
);
Account.hasMany(Theme);
Theme.belongsToMany(Account, {through: AccountTheme});

const AccountLvlCharter = connection.define("account_lvl_charter",
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

const Message = connection.define("message",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            unique: false,
            autoIncrement: true
        },
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
Theme.hasMany(Message);
Message.belongsToMany(Theme, {through: 'theme_message'});

const Question = connection.define("question",
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
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            defaultValue: ""
        },
        type: {
            type: DataTypes.ENUM("choiceOne"),
            allowNull: false,
            defaultValue: "choiceOne"
        },
        level: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        cost: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        }
    }
);

const ThemePostQuestion = connection.define("theme_post_question",
    {
        is_milestone: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }
);

Theme.hasMany(Question);
Question.belongsToMany(Theme, {through: ThemePostQuestion});

const LikeCheck = connection.define("theme_post_question",
    {
        account_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Account,
                key: 'id'
            }
        },
        message_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Message,
                key: 'id'
            }
        }
    }
);

const QuestionAddition = connection.define("question_addition",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            unique: false,
            autoIncrement: true
        },
        question_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Question,
                key: 'id'
            }
        },
        media_path: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }
);

module.exports = {
    Account,
    Role,
    Class,
    Theme,
    Module,
    Charter,
    AccountLvlCharter,
    Message,
    ThemePostQuestion,
    Question,
    LikeCheck,
    QuestionAddition
}