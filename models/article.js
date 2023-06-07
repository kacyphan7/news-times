'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class article extends Model {
    static associate(models) {
      // define association here
    }
  }

  article.init(
    {
      author: DataTypes.STRING,
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      content: DataTypes.STRING,
      publishedAt: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'article',
    }
  );

  // Add a custom method to fetch all articles
  article.getAllArticles = async () => {
    try {
      const allArticles = await article.findAll();
      return allArticles;
    } catch (error) {
      throw new Error('Failed to fetch articles');
    }
  };


  return article;
};
