const JobProfileScore = require('../models').JobProfileScore;
const MatchScore = require('../models').MatchScore;
const Job = require('../models').Job;
const Profile = require('../models').Profile;
const constants = require("../utils/constants").constants;

let defaultMatchScore;

const deleteProfileScore = async (id) => {
    try {
        JobProfileScore.destroy({
            where: { profileId: id },
        });
        console.log(`All jobs score delete successfully for profile: ${id}`);
    } catch (error) {
        console.error(`Error while deleting profile score: ${error.message}`);
    }
}

const updateProfileScore = async (profile) => {
    try {
        await deleteProfileScore(profile.id);
        const jobs = await Job.findAll({
            offset: 0, limit: 1000, raw: true,
        });
        let count = 0;
        while (jobs.length > 0) {
            jobs.forEach(async job => {
                const matchScore = await MatchScore.findOne({
                    where: { profileId: job.createdBy },
                    raw: true,
                });
                await processJobProfileScore(profile, job, matchScore);
            });
            if (jobs.length == 1000) {
                count += 1000;
                jobs = await Job.findAll({
                    offset: count, limit: 1000, raw: true,
                });
            } else {
                jobs = [];
            }
        }
        console.log(`All jobs score updated successfully for profile: ${profile.id}`);
    } catch (error) {
        console.error(`Error while updating profile score: ${error.message}`);
    }
}

const deleteJobScore = async (id) => {
    try {
        JobProfileScore.destroy({
            where: { jobId: id },
        });
        console.log(`All score delete successfully for job: ${id}`);
    } catch (error) {
        console.error(`Error while deleting job score: ${error.message}`);
    }
}


const updateJobScore = async (job) => {
    try {
        await deleteJobScore(job.id);
        const profiles = await Profile.findAll({
            where: { roleTag: constants.ROLE_TAGS.CANDIDATE },
            offset: 0, limit: 1000, raw: true,
        });
        const matchScore = await MatchScore.findOne({
            where: { profileId: job.createdBy },
            raw: true,
        });
        let count = 0;
        while (profiles.length > 0) {
            profiles.forEach(async profile => {
                await processJobProfileScore(profile, job, matchScore);
            });
            if (profiles.length == 1000) {
                count += 1000;
                profiles = await Profile.findAll({
                    where: { roleTag: constants.ROLE_TAGS.CANDIDATE },
                    offset: count, limit: 1000, raw: true,
                });
            } else {
                profiles = [];
            }
        }
        console.log(`All score updated successfully for job: ${job.id}`);
    } catch (error) {
        console.error(`Error while updating job score: ${error.message}`);
    }
}

const processJobProfileScore = async (profile, job, matchScore) => {
    try {
        if (!matchScore) {
            if (!defaultMatchScore) {
                defaultMatchScore = await MatchScore.findOne({
                    where: { profileId: constants.DEFAULT },
                    raw: true,
                });
            }
            matchScore = defaultMatchScore;
        }
        let score = {
            jobId: job.id,
            profileId: profile.id,
            score: 0,
        }
        // primarySkill
        if (job.primarySkills.toLowercase().sort() === profile.primarySkillIds.toLowercase().sort()) {
            score.score += matchScore.primarySkill;
        }
        // secondarySkill
        if (job.secondarySkills.toLowercase().sort() === profile.secondarySkillIds.toLowercase().sort()) {
            score.score += matchScore.secondarySkill;
        }
        // industry
        if (job.industryId.toLowercase().sort() === profile.industryIds.toLowercase().sort()) {
            score.score += matchScore.industry;
        }
        // visaType
        if (job.visaId.toLowercase().sort() === profile.visaIds.toLowercase().sort()) {
            score.score += matchScore.visaType;
        }
        // experiance
        if (job.experienceRequired.toLowercase().sort() === profile.totalExperience.toLowercase().sort()) {
            score.score += matchScore.experiance;
        }
        // salary => job
        if (job.experienceRequired.toLowercase().sort() === profile.salaryRangeId.toLowercase().sort()) {
            score.score += matchScore.salary;
        }
        // jobTitle => job
        if (job.title.toLowercase().sort() === profile.jobTitleId.toLowercase().sort()) {
            score.score += matchScore.jobTitle;
        }
        // remoteWork
        if (job.title.toLowercase().sort() === profile.jobTitleId.toLowercase().sort()) {
            score.score += matchScore.remoteWork;
        }
        // location => job
        if ((job.lat + "," + job.long) === profile.location) {
            score.score += matchScore.location;
        }
        // education => job
        if (job.education === profile.educationId) {
            score.score += matchScore.education;
        }

        if (score.score >= 50) {
            await JobProfileScore.create(score);
        }
    } catch (error) {
        console.error(`Error while updating job score: ${error.message}`);
    }
}

module.exports = {
    updateProfileScore,
    updateJobScore,
    deleteProfileScore,
    deleteJobScore,
};