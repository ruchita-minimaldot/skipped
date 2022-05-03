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
    } catch (error) {
        console.error(`Error while deleting profile score: ${error.message}`);
    }
}

const updateProfileScore = async (profileId) => {
    try {
        let profile = await Profile.findOne({
            where: { id: profileId },
        });
        await deleteProfileScore(profileId);
        let jobs = await Job.findAll({
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
    } catch (error) {
        console.error(`Error while updating profile score: ${error.message}`);
    }
}

const deleteJobScore = async (id) => {
    try {
        JobProfileScore.destroy({
            where: { jobId: id },
        });
    } catch (error) {
        console.error(`Error while deleting job score: ${error.message}`);
    }
}

const countJobScore = (job, profile, compare, skillCount, param) => {
    jobArr = job.toString().split(",");
    profileArr = profile.toString().split(",");
    let count = 0;
   
    if(param === 'rw') {
        return skillCount
    } else {
        profileArr.forEach(p => {
            if (jobArr.includes(p)) {
                count++;
            }
        });
    }
  
    if(compare) {
        const pPer = count / jobArr.length;
        return skillCount * pPer;
    } else {
        if(count > 0) {
            return skillCount
        } else {
            return 0;
        }
    }
}

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
}


const updateJobScore = async (jobId) => {
    try {
        let job = await Job.findOne({
            where: { id: jobId },
        });
        await deleteJobScore(jobId);
        let profiles = await Profile.findAll({
            where: { roleTag: constants.ROLE_TAGS.CANDIDATE },
            offset: 0, limit: 1000, raw: true,
        });
        let matchScore = await MatchScore.findOne({
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
        if (job.primarySkills && profile.primarySkillIds) {
            score.score += countJobScore(job.primarySkills, profile.primarySkillIds, true, matchScore.primarySkill, 'ps');
        }
        if (job.secondarySkills && profile.secondarySkillIds) {
            score.score += countJobScore(job.secondarySkills, profile.secondarySkillIds, true, matchScore.secondarySkill, 'ss');
        }
        if (job.industryIds && profile.industryIds) {
            score.score += countJobScore(job.industryIds, profile.industryIds, true, matchScore.industry, 'in');
        }
        if (job.visaIds && profile.visaIds) {
            score.score += countJobScore(job.visaIds, profile.visaIds, true, matchScore.visaType, 'vt');
        }
        if (job.totalExperienceIds && profile.totalExperience) {
            score.score += countJobScore(job.totalExperienceIds, profile.totalExperience, false, matchScore.experiance, 'te');
        }
        if (job.salaryRangeIds && profile.salaryRangeId) {
            score.score += countJobScore(job.salaryRangeIds, profile.salaryRangeId, false, matchScore.salary, 'sa');
        }
        if (job.jobTitleIds && profile.jobTitleId) {
            score.score += countJobScore(job.jobTitleIds, profile.jobTitleId, false, matchScore.jobTitle, 'jt');
        }
        if ((job.remote === true) && (profile.remote === 1)) {
            score.score += countJobScore(job.remote, profile.remote, false, matchScore.remoteWork, 'rw');
        }
        if (job.location && profile.location) {
            jLL = job.location.split(",");
            pLL = profile.location.split(",");
            distKM = getDistanceFromLatLonInKm(jLL[0], jLL[1], pLL[0], pLL[1]);
            let dPer = 0;
            if (distKM < 30) {
                dPer = 1;
            } else if (distKM < 50) {
                dPer = 0.75;;
            } else if (distKM < 100) {
                dPer = 0.5;
            }
            score.score += matchScore.location * dPer;
        }
        if (job.preferredEducationIds && profile.educationId) {
            score.score += countJobScore(job.preferredEducationIds, profile.educationId, false, matchScore.education, 'ed');
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