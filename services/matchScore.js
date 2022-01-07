const MatchScore = require("../models").MatchScore;
const constants = require("../utils/constants").constants;

const getMatchScores = async (req, res, _) => {
  try {
    const matchScore = await MatchScore.findAll({
      where: { profileId: req.body.profile.id },
    });
    return res.json(matchScore);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Error while getting matchScore.",
      description: error.message,
    });
  }
};

const getMatchScore = async (req, res, _) => {
  try {
    const matchScore = await MatchScore.findOne({
      where: { id: req.params.id, profileId: req.body.profile.id },
    });
    await MatchScore.upsert(matchScore);
    return res.json(matchScore);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Error while getting matchScore.",
      description: error.message,
    });
  }
};

const postMatchScore = async (req, res, _) => {
  try {
    delete req.body.id;
    if (req.body.profile.roleTag === constants.ROLE_TAGS.CANDIDATE) {
      return res.status(400).json({
        message: "Candidate cannot set match score.",
        description: "Match score creation is allowed by this profile.",
      });
    } else if (req.body.profile.roleTag === constants.ROLE_TAGS.RECRUITER) {
      req.body.profileId = req.body.profile.id;
    } else {
      req.body.profileId = constants.DEFAULT;
    }
    let matchScore = await MatchScore.findOne({
      where: { profileId: req.body.profile.id },
    });
    if (matchScore?.length > 0) {
      return res.status(400).json({
        message: "Match score already exists.",
        description: "Only 1 match score is supported per profile.",
      });
    }
    matchScore = await MatchScore.create(req.body);
    return res.json(matchScore);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Error while creating matchScore.",
      description: error.message,
    });
  }
};

const putMatchScore = async (req, res, _) => {
  try {
    if (req.body.profile.roleTag === constants.ROLE_TAGS.CANDIDATE) {
      return res.status(400).json({
        message: "Candidate cannot set match score.",
        description: "Match score creation is allowed by this profile.",
      });
    } else if (req.body.profile.roleTag === constants.ROLE_TAGS.RECRUITER) {
      req.body.profileId = req.body.profile.id;
    } else {
      req.body.profileId = "default";
    }
    const matchScore = await MatchScore.findOne({
      where: { id: req.params.id, profileId: req.body.profile.id },
    });
    if (!matchScore) {
      return res.status(403).json({
        message: "Invalid matchScore Id",
        description: "User is not authorized to update matchScore.",
      });
    }
    const exp = await MatchScore.upsert(req.body);
    return res.json(exp);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Error while updating matchScore.",
      description: error.message,
    });
  }
};

const deleteMatchScore = async (req, res, _) => {
  try {
    const matchScore = await MatchScore.destroy({
      where: { id: req.params.id },
    });
    return res.json(matchScore);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Error while deleting matchScore.",
      description: error.message,
    });
  }
};

module.exports = {
  getMatchScores,
  postMatchScore,
  getMatchScore,
  putMatchScore,
  deleteMatchScore,
};
