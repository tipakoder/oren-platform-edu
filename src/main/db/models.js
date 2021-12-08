const {DataTypes, literal} = require("sequelize");
const connection = require("./connection");

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

const Charter = connection.define("charter",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            unique: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
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
    },
    {
        hooks: {
            afterCreate: async function(charter, options) {
                let charters = await Account.findAll();
                for (let i = 0; i < charters.length; i++) {
                    const el = charters[i];
                    AccountLvlCharter.create({
                      account_id: el.id,
                      charter_id: charter.id
                    });
                } 
            }
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
        role: {
            type: DataTypes.ENUM("admin", "teacher", "student"),
            allowNull: false,
            defaultValue: "student"
        },
        class_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Class,
                key: 'id'
            }
        },
        strick_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
    },
    {
        hooks: {
            afterCreate: async function(user, options) {
                let charters = await Charter.findAll();
                for (let i = 0; i < charters.length; i++) {
                    const el = charters[i];
                    AccountLvlCharter.create({
                      account_id: user.id,
                      charter_id: el.id
                    });
                } 
            }
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

const AccountAchievement = connection.define("account_achievement", {
    account_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Account,
            key: 'id'
        }
    },
    charter_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Charter,
            key: 'id'
        }
    },
    achievement_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
            unique: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        charter_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Charter,
                key: 'id'
            }
        },
        time_round: {
            type: DataTypes.TIME,
            defaultValue: "00:10:00"
        }
    }
);

const Theme = connection.define("theme",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            unique: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        time_round: {
            type: DataTypes.TIME,
            allowNull: false,
            defaultValue: "00:10:00"
        }
    }
);

const ThemeModule = connection.define("theme_module", {
    module_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Module,
            key: 'id'
        }
    },
    theme_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Theme,
            key: 'id'
        }
    }
});

Theme.hasMany(ThemeModule, {
    foreignKey: {
        name: 'theme_id',
        allowNull: false,
    },
    onDelete: 'CASCADE'
})
Module.hasMany(ThemeModule, {
    foreignKey: {
        name: 'module_id',
        allowNull: false,
    },
    onDelete: 'CASCADE'
});

const Test = connection.define("test",
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
            allowNull: false,
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
        },
        theme_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Theme,
                key: 'id'
            }
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        time_round: {
            type: DataTypes.TIME
        },
        end_date: {
            type: DataTypes.DATE
        },
        close: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
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
        author: {
            type: DataTypes.INTEGER,
            references: {
                model: Account,
                key: 'id'
            }
        }
    }
);
Message.belongsTo(Account, { foreignKey:'author', onDelete: 'CASCADE'} );

const ThemeMessage = connection.define("theme_message",
    {
        message_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Message,
                key: 'id'
            }
        },  
        theme_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Theme,
                key: 'id'
            }
        }
    }
);
Theme.hasMany(ThemeMessage, {
    foreignKey: {
        name: 'theme_id',
        allowNull: false,
    },
    onDelete: 'CASCADE'
});
Message.hasMany(ThemeMessage, {
    foreignKey: {
        name: 'message_id',
        allowNull: false,
    },
    onDelete: 'CASCADE'
});

const Question = connection.define("question",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            unique: true,
            autoIncrement: true
        },
        description: {
            type: DataTypes.STRING,
            unique: true
        },
        type: {
            type: DataTypes.ENUM("oneCurrent", "twoCurrent", "sequenceCurrent"),
            allowNull: false,
            defaultValue: "oneCurrent"
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
            allowNull: false,
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
Question.hasMany(QuestionAddition, {
    foreignKey: {
        name: 'question_id',
        allowNull: false,
    },
    onDelete: 'CASCADE'
})

const ThemeQuestion = connection.define("theme_question",
    {
        is_milestone: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        theme_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Theme,
                key: 'id',
            },
            onDelete: 'CASCADE'
        },
        question_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Question,
                key: 'id'
            },
            onDelete: 'CASCADE'
        }
    }
);
Theme.hasMany(ThemeQuestion, {
    foreignKey: {
        name: 'theme_id',
        allowNull: false,
    },
    onDelete: 'CASCADE'
});
Question.hasMany(ThemeQuestion, {
    foreignKey: {
        name: 'question_id',
        allowNull: false,
    },
    onDelete: 'CASCADE'
});

const LikeCheck = connection.define("like_check",
    {
        account_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Account,
                key: 'id'
            }
        },
        message_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Message,
                key: 'id'
            }
        }
    }
);

Account.hasMany(LikeCheck, {
    foreignKey: {
        name: 'account_id',
        allowNull: false,
    },
    onDelete: 'CASCADE'
});
Message.hasMany(LikeCheck, {
    foreignKey: {
        name: 'message_id',
        allowNull: false,
    },
    onDelete: 'CASCADE'
});

const ThemeCheckAccount = connection.define("theme_check_account", 
    {
        account_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Account,
                key: 'id'
            }
        },
        theme_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Theme,
                key: 'id'
            }
        } 
    }
);
Theme.hasMany(ThemeCheckAccount, {
    foreignKey: {
        name: 'theme_id',
        allowNull: false,
    },
    onDelete: 'CASCADE'
});

const ModuleCheckAccount = connection.define("module_check_account", 
    {
        account_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Account,
                key: 'id'
            }
        },
        module_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
            unique: true,
            autoIncrement: true
        },
        is_correct: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
            
        },
        question_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Question,
                key: 'id'
            }
        } 
    }
);

Question.hasMany(ResponseQuestion, {
    foreignKey: {
        name: 'question_id',
        allowNull: false,
    }
});
ResponseQuestion.belongsTo(Question, {
    foreignKey: {
        name: 'question_id',
        allowNull: false,
    } 
});

const AnswerQuestion = connection.define("answer_question", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        unique: false,
        autoIncrement: true
    },
    test_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Test,
            key: 'id'
        }
    },
    question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Question,
            key: 'id'
        }
    },
    response_question_id: {
        type: DataTypes.INTEGER,
        references: {
            model: ResponseQuestion,
            key: 'id'
        }
    },
});

Test.hasMany(AnswerQuestion, {
    foreignKey: {
        name: 'test_id',
        allowNull: false,
    }
});
AnswerQuestion.belongsTo(Question, {
    foreignKey: {
        name: 'question_id',
        allowNull: false,
    }
});
AnswerQuestion.belongsTo(ResponseQuestion, {
    foreignKey: {
        name: 'response_question_id',
    }
});


const AccountSession = connection.define("account_session", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        unique: false,
        autoIncrement: true
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false
    },
    account_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Account,
            key: 'id'
        }
    }
});

Account.hasMany(AccountSession, {
    foreignKey: {
        name: 'account_id',
        allowNull: false,
    }
});


module.exports = {
    Account,
    Class,
    Achievement,
    Charter,
    Module,
    Theme,
    ThemeQuestion,
    Question,
    QuestionAddition,
    AccountLvlCharter,
    Test,
    Message,
    ThemeMessage,
    AccountAchievement,
    LikeCheck,
    ThemeCheckAccount,
    ModuleCheckAccount,
    ResponseQuestion,
    AnswerQuestion,
    ThemeModule,
    AccountSession
}