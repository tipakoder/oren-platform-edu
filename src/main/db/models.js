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
        },
        role_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Role,
                key: 'id'
            }
        },
        class_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Class,
                key: 'id'
            }
        }
    }
);


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
        },
        charter_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Charter,
                key: 'id'
            }
        }
    }
);

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
        },
        module_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Module,
                key: 'id'
            }
        }
    }
);

const AccountTheme = connection.define("account_theme",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            unique: false,
            autoIncrement: true
        },
        account_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Account,
                key: 'id'
            }
        },
        theme_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Theme,
                key: 'id'
            }
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

const AccountLvlCharter = connection.define("account_lvl_charter",
    {
        progress_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
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
        rank_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }
);

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
        count_like: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }
);
const ThemeMessage = connection.define("theme_message",
    {
        message_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Message,
                key: 'id'
            }
        },  
        theme_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Theme,
                key: 'id'
            }
        }
    }
)

const TypeQuestion = connection.define("type_question", 
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
        }
    }
);

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
        type_id: {
            type: DataTypes.INTEGER,
            references: {
                model: TypeQuestion,
                key: 'id'
            }
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

const ThemePostQuestion = connection.define("theme_post_question",
    {
        is_milestone: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        theme_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Theme,
                key: 'id'
            }
        },
        question_id: {
            type: DataTypes.INTEGER,
            references: {
            model: Question,
                key: 'id'
            }
        }
    }
);

const LikeCheck = connection.define("like_check",
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

const ThemeCheckAccount = connection.define("theme_check_account", 
    {
        account_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Account,
                key: 'id'
            }
        },
        theme_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Theme,
                key: 'id'
            }
        } 
    }
);

const ModuleCheckAccount = connection.define("module_check_account", 
    {
        account_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Account,
                key: 'id'
            }
        },
        module_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Module,
                key: 'id'
            }
        } 
    }
);

const ResponseQuestion = connection.define("response_question",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            unique: false,
            autoIncrement: true
        },
        is_current: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        question_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Question,
                key: 'id'
            }
        } 
    }
)

module.exports = {
    Account,
    Role,
    Class,
    Achievement,
    Charter,
    Module,
    Theme,
    ThemePostQuestion,
    Question,
    TypeQuestion,
    QuestionAddition,
    AccountLvlCharter,
    AccountTheme,
    Message,
    ThemeMessage,
    AccountAchievement,
    LikeCheck,
    ThemeCheckAccount,
    ModuleCheckAccount,
    ResponseQuestion
}