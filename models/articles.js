'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class articles extends Model {
    static associate(models) {
      // define association here
    }
  }

  articles.init(
    {
      author: DataTypes.STRING,
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      content: DataTypes.STRING,
      publishedAt: DataTypes.DATE
    },
    {
      sequelize,
      modelName: 'articles',
    }
  );

  // Add a custom method to fetch all articles
  articles.getAllArticles = async () => {
    try {
      const allArticles = await articles.findAll();
      return allArticles;
    } catch (error) {
      throw new Error('Failed to fetch articles');
    }
  };


  return articles;
};
