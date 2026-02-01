const {Router}=require('express');
const {registerVoter, loginVoter, getVoter}=require('../controllers/voterController');
const { addElection, getElections, getElection, removeElection, updateElection, getCandidateOfElection, getElectionVoters } = require('../controllers/ElectionControler');
const { addCandidate, removeCandidate, getCandidate, updateCandidate } = require('../controllers/candidateController');
const router=Router();

router.post("/voters/register",registerVoter);
router.post("/voters/login",loginVoter)
router.get("/voters/:id",getVoter)



router.post("/elections",addElection);
router.get("/elections",getElections);
router.get("/elections/:id",getElection);
router.delete("/elections/:id",removeElection);
router.patch("/elections/:id",updateElection)
router.get("/elections/:id/candidates",getCandidateOfElection)
router.get("/elections/:id/voters",getElectionVoters)





router.post("/candidates",addCandidate)
router.delete("/candidates/:id",removeCandidate)
router.get("/candidates/:id",getCandidate)
router.patch("/candidates/:id",updateCandidate)





module.exports=router;//routes can be added here