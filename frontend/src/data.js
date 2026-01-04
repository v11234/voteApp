import Thumbnail1 from './assets/flag1.jpg';
import Thumbnail2 from './assets/flag2.jpg';
import Thumbnail3 from './assets/flag3.png';




import Candidate1 from './assets/candidate1.jpg';
import Candidate2 from './assets/candidate2.jpg';
import Candidate3 from './assets/candidate3.jpg';   
import Candidate4 from './assets/candidate4.jpg';
import Candidate5 from './assets/candidate5.jpg';
import Candidate6 from './assets/candidate6.jpg';   
import Candidate7 from './assets/candidate7.jpg';




export const elections=[
    {
        id:"el",
        title:"Havard County Elections",
        description:"Havard County Elections is a non-profit organization that aims to provide fair and transparent elections in Havard County. We work to ensure that every vote counts and that the electoral process is accessible to all citizens.",
        thumbnail:      Thumbnail1,
        candidates:["c1", "c2", "c3"],
        voters:[],
    },
    {
        id:"e2",
        title:"Havard County Elections 2024",
        description:"Havard County Elections 2024 is the upcoming election for the Havard County Council. We are committed to providing a fair and transparent electoral process, ensuring that every citizen has a voice in shaping the future of our community.",
        thumbnail:Thumbnail2,
        candidates:["c4", "c5", "c6"],
        voters:[],
    },
    {
        id:"e3",
        title:"Havard County Elections 2025",
        description:"Havard County Elections 2025 is the future election for the Havard County Council. We are dedicated to upholding the principles of democracy and ensuring that every citizen has the opportunity to participate in the electoral process.",
        thumbnail:Thumbnail3,
        candidates:["c7", "c8", "c9"],
        voters:[],

    },
  
]

export const candidates=[
    {
        id:"c1",
        fullName:"vanetti aime junior",
        image:Candidate1,
        moto:"For a better Havard County",
        voteCount:4000,
        election:"el",
    },
    {
        id:"c2",
        fullName:"john doe",
        image:Candidate2,
        moto:"Together we can make a difference",
        voteCount:2250,
        election:"el",
    },
    {
        id:"c3",
        fullName:"jane smith",  
        image:Candidate3,
        moto:"Building a brighter future",
        voteCount:550,
        election:"el",  
    },
    {
        id:"c4", 
        fullName:"alice johnson",
        image:Candidate4,
        moto:"Empowering our community",
        voteCount:800,
        election:"e2",
    },
       
    ];

    export const voters=[
    {
        id:"v1",
        fullName:"Michael Brown",
        email:"vanettijunior@gmail.com",
        password:"Vanetti123",
        isAdmin:true,
        votedElections:["e2"]
    },
    {
        id:"v2",
        fullName:"Emily Davis",
        email:"emily.davis@example.com",
        password:"password456",
        isAdmin:false,
        votedElections:["el", "e2"]
    },
    {
        id:"v3",
        fullName:"David Wilson",
        email:"david.wilson@example.com",
        password:"mypassword789",
        isAdmin:false,
        votedElections:["el"," e3"," e2"]

    },
    {
        id:"v4",
        fullName:"Sarah Miller",
        email:"sarah.miller@example.com",
        password:"",
        isAdmin:false,
        votedElections:[]
    }
]
      
        