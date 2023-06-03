const axios = require('axios');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const response = await axios.get('http://localhost:3000/');
      const articles = response.data.map(c => {
        const result = {
          author: c.author,
          title: c.title,
          urlToImage: c.urlToImage,
          description: c.description,
          url: c.url,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        return result;
      });

      console.log('New articles', articles); // Array of articles

      await queryInterface.bulkInsert('articles', articles, {});
    } catch (error) {
      console.error(error);
    }
  },

  async down(queryInterface, Sequelize) {
    // Add commands to revert seed here
    await queryInterface.bulkDelete('articles', null, {});
  }
};
