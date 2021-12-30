module.exports = function (sequelize, Sequelize) {
    var JobProfileSchema = sequelize.define('JobProfileScore', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
        },
        profileId: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        jobId: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        score: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
    }, {
        paranoid: false,
        timestamps: true,
    });
    return JobProfileSchema;
}