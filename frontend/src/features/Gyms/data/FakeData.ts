export interface Gym {
    id: string;
    name: string;
    description?: string;
    address?: string;
    city?: string;
    image?: string;
    phone?: string;
    website?: string;
    verified?: boolean;

    equipment: Equipment[];
}

export interface Equipment {
    id: string;
    name : string;
    imageUrl? : string;
}


// export async function getFakeData(): Promise<Gym[]> {
//     return [
//         { id: 1, name: "Apex Studio", city: "London" },
//         { id: 2, name: "Peak Motion", city: "Manchester" },
//         { id: 3, name: "Iron Harbor", city: "Birmingham" },
//     ];
// }
 

const mockGyms: Gym[] = [
    {    
        id : "gym-uuid-1",
        name : "Apex Studio",
        description : "A modern gym with state-of-the-art equipment.",
        address : "123 Fitness St.",
        city : "London",
        image : "https://example.com/images/apex-studio.jpg",
        phone : "+44 20 1234 5678",
        website : "https://apexstudio.com",
        verified : true,
        equipment : [
            { id : "equipment-uuid-1", name : "Treadmill", imageUrl : "https://example.com/images/treadmill.jpg" },
            { id : "equipment-uuid-2", name : "Elliptical", imageUrl : "https://example.com/images/elliptical.jpg" },
            { id : "equipment-uuid-3", name : "Cycle", imageUrl: "https://example.com/images/cycle.jpg" }
        ]   
    },
    {
        id : "gym-uuid-2",
        name : "Peak Motion",
        description : "A high-energy gym with a variety of classes.",
        address : "456 Workout Ave.",
        city : "Manchester",
        image : "https://example.com/images/peak-motion.jpg",
        phone : "+44 161 234 5678",
        website : "https://peakmotion.com",
        verified : false,
        equipment : [
            { id : "equipment-uuid-4", name : "Rowing Machine", imageUrl : "https://example.com/images/rowing-machine.jpg" },
            { id : "equipment-uuid-5", name : "Stair Climber", imageUrl : "https://example.com/images/stair-climber.jpg" }
        ]
    },
    {
        id : "gym-uuid-3",
        name : "Iron Harbor",
        description : "A traditional gym with a focus on strength training.",
        address : "789 Muscle Blvd.",
        city : "Birmingham",
        image : "https://example.com/images/iron-harbor.jpg",
        phone : "+44 121 234 5678",
        website : "https://ironharbor.com",
        verified : true,
        equipment : [
            { id : "equipment-uuid-6", name : "Bench Press", imageUrl : "https://example.com/images/bench-press.jpg" },
            { id : "equipment-uuid-7", name : "Squat Rack", imageUrl : "https://example.com/images/squat-rack.jpg" },
            { id : "equipment-uuid-8", name : "Dumbbells", imageUrl: "https://example.com/images/dumbbells.jpg" }
        ]
    },
    {
        id : "gym-uuid-4",
        name : "Flex Factory",
        description : "A boutique gym with personalized training programs.",
        address : "321 Strength Ln.",
        city : "Leeds",
        image : "https://example.com/images/flex-factory.jpg",
        phone : "+44 113 234 5678",
        website : "https://flexfactory.com",
        verified : false,
        equipment : [
            { id : "equipment-uuid-9", name : "Kettlebells", imageUrl : "https://example.com/images/kettlebells.jpg" },
            { id : "equipment-uuid-10", name : "Resistance Bands", imageUrl : "https://example.com/images/resistance-bands.jpg" }
        ]
    },
    {
        id : "gym-uuid-5",
        name : "Cardio Central",
        description : "A cardio-focused gym with a variety of machines.",
        address : "654 Endurance Rd.",
        city : "Liverpool",
        image : "https://example.com/images/cardio-central.jpg",
        phone : "+44 151 234 5678",
        website : "https://cardiocentral.com",
        verified : true,
        equipment : [
            { id : "equipment-uuid-11", name : "Treadmill", imageUrl : "https://example.com/images/treadmill.jpg" },
            { id : "equipment-uuid-12", name : "Elliptical", imageUrl : "https://example.com/images/elliptical.jpg" },
            { id : "equipment-uuid-13", name : "Stationary Bike", imageUrl: "https://example.com/images/stationary-bike.jpg" }
        ]
    },
    {
        id : "gym-uuid-6",
        name : "Strength Haven",
        description : "A strength training gym with a focus on free weights.",
        address : "987 Power St.",
        city : "Bristol",
        image : "https://example.com/images/strength-haven.jpg",
        phone : "+44 117 234 5678",
        website : "https://strengthhaven.com",
        verified : false,
        equipment : [
            { id : "equipment-uuid-14", name : "Barbells", imageUrl : "https://example.com/images/barbells.jpg" },
            { id : "equipment-uuid-15", name : "Dumbbells", imageUrl : "https://example.com/images/dumbbells.jpg" },
            { id : "equipment-uuid-16", name : "Power Rack", imageUrl: "https://example.com/images/power-rack.jpg" }
        ]
    },
    {
        id : "gym-uuid-7",
        name : "Zen Fitness",
        description : "A wellness-focused gym with yoga and meditation classes.",
        address : "159 Mindful Way",
        city : "Cambridge",
        image : "https://example.com/images/zen-fitness.jpg",
        phone : "+44 1223 234 5678",
        website : "https://zenfitness.com",
        verified : true,
        equipment : [
            { id : "equipment-uuid-17", name : "Yoga Mats", imageUrl : "https://example.com/images/yoga-mats.jpg" },
            { id : "equipment-uuid-18", name : "Meditation Cushions", imageUrl : "https://example.com/images/meditation-cushions.jpg" }
        ]
    },
    {
        id : "gym-uuid-8",
        name : "HIIT Hub",
        description : "A high-intensity interval training gym with group classes.",
        address : "753 Cardio Blvd.",
        city : "Sheffield",
        image : "https://example.com/images/hiit-hub.jpg",
        phone : "+44 114 234 5678",
        website : "https://hiithub.com",
        verified : false,
        equipment : [
            { id : "equipment-uuid-19", name : "Battle Ropes", imageUrl : "https://example.com/images/battle-ropes.jpg" },
            { id : "equipment-uuid-20", name : "Plyometric Boxes", imageUrl : "https://example.com/images/plyometric-boxes.jpg" }
        ]
    },
    {
        id : "gym-uuid-9",
        name : "CrossFit Corner",
        description : "A CrossFit gym with a focus on functional fitness.",
        address : "852 Strength St.",
        city : "Nottingham",
        image : "https://example.com/images/crossfit-corner.jpg",
        phone : "+44 115 234 5678",
        website : "https://crossfitcorner.com",
        verified : true,
        equipment : [
            { id : "equipment-uuid-21", name : "Kettlebells", imageUrl : "https://example.com/images/kettlebells.jpg" },
            { id : "equipment-uuid-22", name : "Pull-Up Bars", imageUrl : "https://example.com/images/pull-up-bars.jpg" },
            { id : "equipment-uuid-23", name : "Medicine Balls", imageUrl: "https://example.com/images/medicine-balls.jpg" }
        ]
    },
    {
        id : "gym-uuid-10",
        name : "Pilates Place",
        description : "A Pilates studio with a variety of classes and equipment.",
        address : "951 Core St.",
        city : "Oxford",
        image : "https://example.com/images/pilates-place.jpg",
        phone : "+44 1865 234 5678",
        website : "https://pilatesplace.com",
        verified : false,
        equipment : [
            { id : "equipment-uuid-24", name : "Reformers", imageUrl : "https://example.com/images/reformers.jpg" },
            { id : "equipment-uuid-25", name : "Pilates Balls", imageUrl : "https://example.com/images/pilates-balls.jpg" }
        ]
    }
];




export async function getFakeData(searchedText : string) : Promise<Gym[]>{
    return new Promise(function(resolve)
    {
        setTimeout(function(){
            const filtredGyms = mockGyms.filter(function(gym){
                return gym.name.toLowerCase().includes(searchedText.toLocaleLowerCase());
            })
            resolve(filtredGyms);
        }, 500);
    })
}
