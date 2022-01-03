const express = require("express");
const app = express();
const port = 8080;

const cors = require("cors");
app.use(cors());
app.use(express.json({ limit: "10mb", extended: true }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
//Sync Database
const models = require("./models");
models.sequelize
  .sync()
  .then(function () {
    console.info("Database is synced");
  })
  .catch(function (error) {
    console.error(error);
  });

// authenticate user
const authentication = require("./middlewares/authentication");
app.use(authentication);

// profile
const profileService = require("./services/profile");
const profileRoute = require("./routes/profile")(profileService);
app.use("/api/profile", profileRoute);

// role
const roleService = require("./services/role");
const roleRoute = require("./routes/role")(roleService);
app.use("/api/role", roleRoute);

// job
const jobService = require("./services/job");
const jobRoute = require("./routes/job")(jobService);
app.use("/api/job", jobRoute);

// job application
const jobApplicationService = require("./services/jobApplication");
const jobApplicationRoute = require("./routes/jobApplication")(
  jobApplicationService
);
app.use("/api/jobApplication", jobApplicationRoute);

// experience
const experienceService = require("./services/experience");
const experienceRoute = require("./routes/experience")(experienceService);
app.use("/api/experience", experienceRoute);

// JobTypes
const jobtypeService = require("./services/jobtype");
const jobtypeRoute = require("./routes/jobtype")(jobtypeService);
app.use("/api/jobtype", jobtypeRoute);

// salaryrange
const salaryRangeService = require("./services/salaryrange");
const salaryRangeRoute = require("./routes/salaryrange")(salaryRangeService);
app.use("/api/salaryrange", salaryRangeRoute);

// travelOption
const travelOptionsService = require("./services/travelOptions");
const travelOptionRangeRoute = require("./routes/travelOptions")(
  travelOptionsService
);
app.use("/api/traveloptions", travelOptionRangeRoute);

// industry
const industryService = require("./services/industry");
const industryangeRoute = require("./routes/industry")(industryService);
app.use("/api/industry", industryangeRoute);

// industry
const jobTitleService = require("./services/jobTitle");
const jobTitleRoute = require("./routes/jobTitle")(jobTitleService);
app.use("/api/jobtitle", jobTitleRoute);

// education
const educationService = require("./services/education");
const educationRoute = require("./routes/education")(educationService);
app.use("/api/education", educationRoute);

// Internship Duration
const internshipDurationService = require("./services/internshipDuration");
const internshipDurationRoute = require("./routes/internshipDuration")(
  internshipDurationService
);
app.use("/api/internshipduration", internshipDurationRoute);

// Company
const companyService = require("./services/company");
const companyRoute = require("./routes/company")(companyService);
app.use("/api/company", companyRoute);

// Company Type
const companyTypeService = require("./services/companyType");
const companyTypeRoute = require("./routes/companyType")(companyTypeService);
app.use("/api/companytype", companyTypeRoute);

// visa type
const visaTypeService = require("./services/visaType");
const visaTypeRoute = require("./routes/visaType")(visaTypeService);
app.use("/api/visaType", visaTypeRoute);

// Skills
const skillService = require("./services/skill");
const skillRoute = require("./routes/skill")(skillService);
app.use("/api/skill", skillRoute);

// Matching score
const matchScoreService = require("./services/matchScore");
const matchScoreRoute = require("./routes/matchScore")(matchScoreService);
app.use("/api/matchscore", matchScoreRoute);

// Status Code
const statusCodeService = require("./services/statusCode");
const statusCodeRoute = require("./routes/statusCode")(statusCodeService);
app.use("/api/statuscode", statusCodeRoute);

// index path
app.get("/", function (_, res) {
  res.send("Skipped API running successfully.");
});

app.listen(port, function () {
  console.info("Skipped API started on - " + port);
});
