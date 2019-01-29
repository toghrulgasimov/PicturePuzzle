const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');


let UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: 'Bu Email artiq movcuddur'
        }
    },
    password: {
        type: String,
        require: true,
        minlength: 6
    },
    gender: {
        type: String
    },
    birthDate: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    image: {
        type: String
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }],
    friends: [{
        status: {
            type: String
        },
        id: {
            type: String
        },
        lastName: {
            type: String
        },
        firstName: {
            type: String
        },
        image: {
            type: String
        }
    }],
    editDate: {
        type: Date
    },
    createDate: {
        type: Date
    },
    newMessage: {
        type: Boolean
    },
    newFriend: {
        type: Boolean
    }
});

UserSchema.methods.generateAuthToken = function () {
    let user = this;
    let access = 'auth';
    let token = jwt.sign({_id: user._id.toHexString(), access}, 'deon-maker').toString();

    user.tokens.push({access, token});

    return user.save().then(() => {
        return token;
    });
};

UserSchema.statics.findByToken = function (token) {
    let User = this;
    let decoded;

    try {
        decoded = jwt.verify(token, 'deon-maker');
    } catch (error) {
        console.log(error);

        return Promise.reject();
    }

    return User.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
}

UserSchema.methods.removeToken = function (token) {
    let user = this;

    return user.update({
        $pull: {
            tokens: {token}
        }
    });
};

UserSchema.statics.rejectFriend = function (id1, id2) {
    let User = this;
    User.findOne({
        '_id': id1
    }).then((u1) => {
        User.findOne({
            '_id': id2
        }).then((u2) => {
            console.log(u1);
            console.log(u2);
            u1.update({
                $pull: {
                    friends: {id: id2}
                }
            }).then(() => {
                return u2.update({
                    $pull: {
                        friends: {id: id1}
                    }
                })
            })


        });
    });

};
UserSchema.statics.acceptFriend = function (id1, id2) {
    let User = this;
    User.findOne({
        '_id': id1
    }).then((u1) => {
        User.findOne({
            '_id': id2
        }).then((u2) => {
            console.log(u1);
            console.log(u2);

            u1.update({'friends.id': id2}, {
                '$set': {
                    'friends.$.status': '2'
                }
            }).then(() => {
                console.log("thennnn");
                return u2.update({'friends.id': id1}, {
                    '$set': {
                        'friends.$.status': '2'
                    }
                })
            })


        });
    });

};


UserSchema.statics.findByToken = function (token) {
    let User = this;
    let decoded;

    try {
        decoded = jwt.verify(token, 'deon-maker');
    } catch (e) {
        return Promise.reject();
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};
UserSchema.statics.findById = function (id) {
    let User = this;
    return User.findOne({
        '_id': id
    });
};

UserSchema.statics.findByCredentials = function (email, password) {
    let User = this;

    return User.findOne({email}).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        return new Promise((resolve, reject) => {
            // Use bcrypt.compare to compare password and user.password
            if (password == user.password) {
                resolve(user);
            } else {
                reject();// sual
            }
        });
    });
};

UserSchema.statics.findByIdSync = async function (id) {
    let User = this;
    return await User.findOne({
        '_id': id
    }).exec();
};

UserSchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj.password;
    delete obj.tokens;
    return obj;
}


let User = mongoose.model('User', UserSchema);

module.exports = {User}