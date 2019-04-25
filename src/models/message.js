const message = (sequelize, DataTypes) => {
  const Message = sequelize.define('message', {
    text: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'A message should not be empty!'
        }
      }
    }
  })

  Message.associate = models => {
    Message.belongsTo(models.User)
  }

  return Message
}

export default message
