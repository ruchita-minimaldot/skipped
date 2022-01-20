module.exports = function (sequelize, Sequelize) {
  var JobSchema = sequelize.define(
    "Job",
    {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      companyId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      travelOption: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      jobDuration: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      remote: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      visaIds: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      paidType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      salaryRangeIds: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      totalExperienceIds: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      jobTypeIds: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      industryIds: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      primarySkills: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      secondarySkills: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      noPositions: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdBy: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      preferredEducationIds: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      jobTitleIds: {
        type: Sequelize.UUID,
        allowNull: true,
      },
    },
    {
      paranoid: true,
      timestamps: true,
    }
  );
  return JobSchema;
};
