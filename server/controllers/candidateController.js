






//==================add new candidate===================================
//POST :api/candidates
//protected (admin)

const addCandidate=(req,res,next)=>{
res.json("add candidate")
}


//==================getcandidate===================================
//get :api/candidates/:id
//protected (admin)

const getCandidate=(req,res,next)=>{
res.json("get candidate")
}


//==================add new candidate===================================
//DELETE :api/candidates/:id
//protected (admin)

const removeCandidate=(req,res,next)=>{
res.json("add candidate")
}


//==================vote candidate===================================
//PATCH :api/candidates/:id
//protected 

const updateCandidate=(req,res,next)=>{
res.json("add candidate")
}

module.exports={addCandidate,removeCandidate,getCandidate,updateCandidate}
