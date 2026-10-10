import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import type { Gym } from "../data/FakeData";
import { getGymById } from "../data/FakeData"; 
import LoadingState from '../../../components/states/LoadingState';
import {Link }from "react-router-dom"


function GymDetailsPage() {
    const { id} = useParams();
    const [gym, setGym] = useState<Gym | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(function(){
        async function getGymDetails(){
            setLoading(true);
            if (!id)return;
            try {
                const data = await getGymById(id);
                if (data)
                    setGym(data);
            } catch (error) {
                console.log(error);
            }
            finally {
                setLoading(false);
            }
        }
        getGymDetails();
    }, [id]);
    if (loading)
        return <LoadingState message="Loading gym info..." />;
    if (!gym)
        return <div className="p-8 text-3xl font-bold">Gym not found!</div>;

    

    return (
        <div className="flex flex-col w-full max-w-[500px] min-h-screen  text-white border-r border-gray-500 ">
            <div className="flex justify-between  p-4 border-b border-gray-600 bg-[#1c1c1c] rounded-2xl mb-1">
                <h1 className="text-xl font-medium">{gym.name}</h1>
                <Link to ={`/gyms`}>
                    <svg className="w-6 h-6 text-red-500 border border-gray-700 hover:scale-120" fill="none" viewBox="0 0 24 24" stroke="currentColor ">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </Link>
            </div>

            <div className="px-4 my-4">
                <img className="w-full h-62.5  rounded-2xl object-cover hover:scale-101" src="https://imgs.search.brave.com/YV90j4kDI6DSkh8Kw4G7e7HwA5zcpNMiEo_kQpUYBY0/rs:fit:1920:0:0:0/g:ce/aHR0cHM6Ly9saDUu/Z29vZ2xldXNlcmNv/bnRlbnQuY29tL3Av/QUYxUWlwUGtUZl8y/aW11UU42R3o1NkRx/TE9md3J4ZmJEMlFH/MXBabi1rbE89dzMw/MC1oMjAwLWstbi1y/dw" alt="{gym.name}" />
            </div>

            <div className="flex flex-wrap gap-4 px-4 mb-6 items-center">
                <button className="flex gap-2 items-center bg-[#2d2d2d] hover:bg-[#383838] rounded-full px-5 py-3  transition-colors ">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                    WebSite
                </button>

                <button className="flex  items-center gap-2 bg-[#2d2d2d] hover:bg-[#383838] rounded-full px-5 py-3 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    Call
                </button>

                <button className="flex  items-center gap-2 bg-[#2d2d2d] hover:bg-[#383838] rounded-full px-5 py-3 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                    Directions
                </button>
            </div>

            <div className="flex flex-col border-t border-gray-700 rounded-2xl bg-[#1c1c1c] rounded-2xl m-1 py-2">
                <div className="flex items-center gap-3 px-5 mb-4  hover:bg-[#2d2d2d] hover:rounded-2xl py-3">
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>opening hour</span>
                    <span>7:00 AM - 11:00 PM</span>
                </div >

                <div className="flex items-center gap-3 px-5 mb-4  hover:bg-[#2d2d2d] hover:rounded-2xl py-3">
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span>{gym.address}</span>
                </div>
                <div className="flex items-center gap-3 px-5 mb-1  hover:bg-[#2d2d2d] hover:rounded-2xl py-3">
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    <span>{gym.phone}</span>
                </div>
            </div>

            <div className="flex  flex-col border-t border-gray-700 px-5 py-6 mb-4" >
                <h2 className="text-lg font-medium mb-4">description</h2>
                <div className="text-lg rounded-2xl bg-[#1c1c1c] rounded-2xl p-4">
                    <p className="text-md text-gray-300  line-clamp-3">{gym.description} Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus nemo fugit, id veniam aut amet fugiat vitae temporibus consequuntur exercitationem. Perspiciatis, officia sunt perferendis accusantium culpa et facere fuga ab!</p>
                </div>
            </div>
            <div className="h-[300px] mr-3 border-t border-gray-700 p-5">
                <h2 className="text-lg font-medium mb-4">Available Equipment</h2>
                <ul className="flex flex-col gap-3 mt-2">
                    {gym.equipment.map((equi) => (
                        <li
                            key={equi.id}
                            className="flex items-center justify-between gap-3 text-lg mb-2 bg-[#1c1c1c] px-4 py-3 rounded-2xl hover:bg-[#2d2d2d] shadow-sm"
                        >
                            <span>{equi.name}</span>
                            {equi.imageUrl ? (
                                <img
                                    src={equi.imageUrl}
                                    alt={equi.name}
                                    className="w-12 h-12 rounded-xl object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#2d2d2d] text-xs text-gray-400">
                                    <span>no img</span>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default GymDetailsPage;