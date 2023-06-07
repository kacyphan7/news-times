const axios = require('axios');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const fakeArticles = [];

      const article = {
        title: 'Apple developer betas are now free to download and install',
        author: 'Peter Cao',
        content: 'Today, Apple updated its developer program to allow anyone access to the beta operating systems. ',
        description: 'Today, Apple updated its developer program to allow anyone access to the beta operating systems.',
        publishedAt: '2023-06-06T21:36:26Z',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      fakeArticles.push(article);
      console.log('Fake articles', article); // Array of articles

      await queryInterface.bulkInsert('articles', fakeArticles, {});
    } catch (error) {
      console.error(error);
    }
  },

  async down(queryInterface, Sequelize) {
    // Add commands to revert seed here
    await queryInterface.bulkDelete('articles', null, {});
  }
};