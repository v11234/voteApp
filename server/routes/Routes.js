const {Router}=require('express');
const {
  registerVoter,
  verifyEmail,
  submitIdCard,
  loginVoter,
  verifyAdmin2FA,
  enrollFace,
  getVoter,
  resendEmailOtp,
  getPendingVoters,
  approveVoter,
  getUsers,
  getAuditLogs,
} = require('../controllers/voterController');
const { addElection, getElections, getElection, removeElection, updateElection, getCandidateOfElection, getElectionVoters } = require('../controllers/ElectionControler');
const { getPublicElections, getPublicElectionCandidates } = require('../controllers/publicController');
const { addCandidate, removeCandidate, getCandidate, voteCandidate } = require('../controllers/candidateController');
const authMiddleware = require('../middlewares/authMiddleware');
const router=Router();
const { requireRole } = require("../middlewares/roleMiddleware");

router.post("/voters/register",registerVoter);
router.post("/voters/verify-email",verifyEmail);
router.post("/voters/submit-id",submitIdCard);
router.post("/voters/resend-otp",resendEmailOtp);
router.post("/voters/login",loginVoter)
router.post("/voters/verify-2fa",verifyAdmin2FA)
router.post("/voters/enroll-face",enrollFace)
router.get("/voters/:id",authMiddleware,getVoter)

router.post("/elections",authMiddleware,addElection);
router.get("/elections",authMiddleware,getElections);
router.get("/elections/public",getPublicElections);
router.get("/elections/:id/candidates/public",getPublicElectionCandidates);
router.get("/elections/:id",authMiddleware,getElection);
router.delete("/elections/:id",authMiddleware,removeElection);
router.patch("/elections/:id",authMiddleware,updateElection)
router.get("/elections/:id/candidates",authMiddleware,getCandidateOfElection)
router.get("/elections/:id/voters",authMiddleware,getElectionVoters)

router.post("/candidates",authMiddleware,addCandidate)
router.delete("/candidates/:id",authMiddleware,removeCandidate)
router.get("/candidates/:id",authMiddleware,getCandidate)
router.patch("/candidates/:id",authMiddleware,voteCandidate)

// admin routes
router.get("/admin/voters/pending",authMiddleware,requireRole("admin"),getPendingVoters)
router.patch("/admin/voters/:id/approve",authMiddleware,requireRole("admin"),approveVoter)
router.get("/admin/users",authMiddleware,requireRole("admin"),getUsers)
router.get("/admin/logs",authMiddleware,requireRole("admin"),getAuditLogs)

module.exports=router;//routes can be added here
