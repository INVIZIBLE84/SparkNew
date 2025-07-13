module.exports = {
  development: {
    storage: 'sequelize',
    storageOptions: {
      tableName: 'sequelize_seeds'
    },
    seederStorageTableName: 'sequelize_seeds'
  },
  test: {
    storage: 'sequelize',
    storageOptions: {
      tableName: 'sequelize_seeds_test'
    },
    seederStorageTableName: 'sequelize_seeds_test'
  },
  production: {
    storage: 'sequelize',
    storageOptions: {
      tableName: 'sequelize_seeds_prod'
    },
    seederStorageTableName: 'sequelize_seeds_prod'
  }
};