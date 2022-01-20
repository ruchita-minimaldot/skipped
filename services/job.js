const Job = require("../models").Job;
const constants = require("../utils/constants").constants;
const JobApplication = require("../models").JobApplication;
const JobProfileScore = require("../models").JobProfileScore;
const jobScore = require("../middlewares/matchScore");

const Op = require("sequelize").Op;

const getJobs = async (req, res, _) => {
  try {
    let jobs;
    if (req.body.profile.roleTag === constants.ROLE_TAGS.RECRUITER) {
      jobs = await Job.findAll({ where: { createdBy: req.body.profile.id } });
    } else {
      jobs = await Job.findAll();
    }
    return res.json(jobs);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Error while fetching jobs.",
      description: error.message,
    });
  }
};

const getJob = async (req, res, _) => {
  try {
    let job;
    if (req.body.profile.roleTag === constants.ROLE_TAGS.RECRUITER) {
      job = await Job.findOne({
        where: { id: req.params.id, createdBy: req.body.profile.id },
      });
    } else {
      job = await Job.findOne({ where: { id: req.params.id } });
    }
    return res.json(job);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Error while getting job.",
      description: error.message,
    });
  }
};

const postJob = async (req, res, _) => {
  try {
    if (req.body.profile.roleTag === constants.ROLE_TAGS.CANDIDATE) {
      return res.status(403).json({
        message: "Recruiter can create job.",
        description: "Job cannot be created with candidate only.",
      });
    }
    delete req.body.id;
    req.body.createdBy = req.body.profile.id;
    const job = await Job.create(req.body);
    jobScore.updateJobScore(job.id);
    return res.json(job);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Error while creating job.",
      description: error.message,
    });
  }
};

const putJob = async (req, res, _) => {
  try {
    if (req.body.profile.roleTag === constants.ROLE_TAGS.CANDIDATE) {
      return res.status(403).json({
        message: "Recruiter can update job.",
        description: "Job cannot be updated with candidate only.",
      });
    }
    const updatedJob = await Job.findOne({
      where: { id: req.params.id, createdBy: req.body.profile.id },
    });
    if (!updatedJob) {
      return res.status(403).json({
        message: "Invalid job Id",
        description: "User is not authorized to update job.",
      });
    }
    req.body.id = req.params.id;
    req.body.createdBy = req.body.profile.id;
    const job = await Job.upsert(req.body);
    jobScore.updateJobScore(req.params.id);
    return res.json(job);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Error while updating job.",
      description: error.message,
    });
  }
};

const deleteJob = async (req, res, _) => {
  try {
    if (req.body.profile.roleTag === constants.ROLE_TAGS.CANDIDATE) {
      return res.status(403).json({
        message: "Recruiter can delete job.",
        description: "Job cannot be updated with candidate profile.",
      });
    }
    const job = await Job.destroy({
      where: { id: req.params.id, createdBy: req.body.profile.id },
    });
    jobScore.deleteJobScore(req.params.id);
    return res.json(job);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Error while deleting job.",
      description: error.message,
    });
  }
};

const findJobs = async (req, res, _) => {
  try {
    let jobs;
    let query = req.query;
    if (query.status) {
      query.status = { [Op.like]: query.status };
    }
    if (req.body.profile.roleTag === constants.ROLE_TAGS.RECRUITER) {
      query.createdBy = req.body.profile.id;
    } else {
      const appliedJobIds = await JobApplication.findAll({
        where: { appliedBy: req.body.profile.id },
        attributes: ["jobId"],
        raw: true,
      });
      let jobIds = appliedJobIds.map((a) => {
        return a.jobId;
      });
      query.id = { [Op.notIn]: jobIds };
      // logic to get by score for candidate
      if (query.minScore && query.maxScore) {
        let jobs = await JobProfileScore.findAll({
          where: { profileId: req.body.profile.id, jobId: { [Op.notIn]: jobIds }, score: { [Op.between]: [query.minScore, query.maxScore] } },
          order: [["score", "DESC"]],
          include: [{ model: Job, as: "job" }],
          nest: true,
          raw: true,
        });
        return res.json(jobs);
      }
    }
    jobs = await Job.findAll({
      where: query,
      order: [["updatedAt", "DESC"]],
      raw: true,
    });
    return res.json(jobs);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Error while searching jobs.",
      description: error.message,
    });
  }
};

module.exports = {
  getJob,
  getJobs,
  postJob,
  putJob,
  deleteJob,
  findJobs,
};
