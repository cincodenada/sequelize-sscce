'use strict';

// Require the necessary things from Sequelize
const { Sequelize, Op, Model, DataTypes } = require('sequelize');

// This function should be used instead of `new Sequelize()`.
// It applies the config for your SSCCE to work on CI.
const createSequelizeInstance = require('./utils/create-sequelize-instance');

// This is an utility logger that should be preferred over `console.log()`.
const log = require('./utils/log');

// You can use sinon and chai assertions directly in your SSCCE if you want.
const sinon = require('sinon');
const { expect } = require('chai');

// Your SSCCE goes inside this function.
module.exports = async function() {
  const sequelize = createSequelizeInstance({
    logQueryParameters: true,
    benchmark: true,
    define: {
      timestamps: false // For less clutter in the SSCCE
    }
  });

  const User = sequelize.define('User', { name: DataTypes.TEXT });
  const UserFollower = sequelize.define('UserFollower', { });
  User.belongsToMany(User, {
    foreignKey: 'userId',
    as: 'followers',
    through: UserFollower
  })
  User.belongsToMany(User, {
    foreignKey: 'followerId',
    as: 'following',
    through: UserFollower
  })

  await sequelize.sync();

  const popular = await User.create({ name: 'Popular' })
  const follower = await User.create({ name: 'Follower' })
  const mutual = await User.create({ name: 'Mutual' })

  await UserFollower.create({
    userId: popular.id,
    followerId: follower.id
  })
  await UserFollower.create({
    userId: popular.id,
    followerId: mutual.id
  })
  await UserFollower.create({
    userId: mutual.id,
    followerId: popular.id
  })

  console.log(await popular.getFollowers({ joinTableAttributes: [] }))

  // And via find methods...
  const popularFromFind = await User.findByPk(popular.id, {
    include: [{
      model: User,
      as: 'followers',
      through: { attributes: [] }
    }]
  })
  console.log(popularFromFind.followers)
};
