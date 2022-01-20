const Profile = require("../models").Profile;
const Job = require("../models").Job;
const JobProfileScore = require("../models").JobProfileScore;
const profileScore = require("../middlewares/matchScore");
const Op = require("sequelize").Op;
const constants = require("../utils/constants").constants;

const getProfiles = async (req, res, _) => {
  try {
    const profiles = await Profile.findAll({
      where: { userId: req.body.user.user_id },
      order: [["updatedAt", "DESC"]],
    });
    return res.json(profiles);
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({
        message: "Error while getting profiles.",
        description: error.message,
      });
  }
};

const getProfile = async (req, res, _) => {
  try {
    const profile = await Profile.findOne({
      where: { id: req.params.id, userId: req.body.user.uid },
      raw: true,
    });
    await Profile.upsert(profile);
    return res.json(profile);
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({
        message: "Error while getting profile.",
        description: error.message,
      });
  }
};

const postProfile = async (req, res, _) => {
  try {
    delete req.body.id;
    req.body.userId = req.body.user.uid;
    const profile = await Profile.create(req.body);
    profileScore.updateProfileScore(profile.id);
    return res.json(profile);
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({
        message: "Error while creating profile.",
        description: error.message,
      });
  }
};

const putProfile = async (req, res, _) => {
  try {
    const userprofile = await Profile.findOne({
      where: { id: req.params.id, userId: req.body.user.uid },
    });
    if (!userprofile) {
      return res
        .status(403)
        .json({
          message: "Invalid profile Id",
          description: "User is not authorized to update profile.",
        });
    }
    req.body.id = req.params.id;
    req.body.userId = req.body.user.uid;
    const profile = await Profile.upsert(req.body);
    profileScore.updateProfileScore(req.params.id);
    return res.json(profile);
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({
        message: "Error while updating profile.",
        description: error.message,
      });
  }
};

const deleteProfile = async (req, res, _) => {
  try {
    const profile = await Profile.destroy({
      where: { id: req.params.id, userId: req.body.user.uid },
    });
    profileScore.deleteProfileScore(id);
    return res.json(profile);
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({
        message: "Error while deleting profile.",
        description: error.message,
      });
  }
};

const findProfiles = async (req, res, _) => {
  try {
    let profiles;
    let query = req.query;
    if (query.id) {
      query.id = { [Op.eq]: query.id };
    }
    if (query.visaIds) {
      query.visaIds = { [Op.like]: query.visaIds };
    }
    if (query.primarySkillIds) {
      query.primarySkillIds = { [Op.like]: query.primarySkillIds };
    }
    if (query.secondarySkillIds) {
      query.secondarySkillIds = { [Op.like]: query.secondarySkillIds };
    }
    if (query.industryIds) {
      query.industryIds = { [Op.like]: query.industryIds };
    }
    if (req.body.profile.roleTag === constants.ROLE_TAGS.RECRUITER) {
      let profileIds = [];
      // logic for get by score for recruiter
      if (query.minScore && query.maxScore && query.jobId && !query.id) {
        let job = await Job.findOne({
          where: { id: query.jobId, createdBy: req.body.profile.id },
        });
        if (!job) {
          return res.status(403).json({
            message: "Invalid job Id",
            description: "User is not authorized to get profile by score for this job.",
          });
        }
        profiles = await JobProfileScore.findAll({
          where: { jobId: query.jobId, score: { [Op.between]: [query.minScore, query.maxScore] } },
          order: [["score", "DESC"]],
          include: [{ model: Profile, as: "profile" }],
          nest: true,
          raw: true,
        });
        return res.json(profiles);
      }
      query.roleTag = constants.ROLE_TAGS.CANDIDATE;
    } else if (req.body.profile.roleTag === constants.ROLE_TAGS.CANDIDATE) {
      query.roleTag = constants.ROLE_TAGS.RECRUITER;
    }
    profiles = await Profile.findAll({
      where: query,
      order: [["updatedAt", "DESC"]],
      raw: true,
    });
    return res.json(profiles);
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({
        message: "Error while searching profiles.",
        description: error.message,
      });
  }
};

module.exports = {
  getProfiles,
  getProfile,
  postProfile,
  putProfile,
  deleteProfile,
  findProfiles,
};
