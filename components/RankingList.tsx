'use client'

import { RankingListDTO } from "@/lib/dtos";
import { useEffect, useState } from "react"
import { Plus } from "lucide-react";
import Link from "next/link";
import RankingListModal from "./RankingListModal";

export default function RankingList() {
    const [rankingList, setRankingList] = useState<RankingListDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");

    const fetchData = async() => {
        try {
            setLoading(true);

            const response = await fetch("/api/ranking-list");

            const { data } = await response.json();

            setRankingList(data);

        } catch (error) {
            setError(error + "")
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchData() }, [])

    // useEffect(() => console.log(rankingList), [rankingList]);

    if(loading)
        return (
        <>
            <div className="flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Učitavanje podataka ...</p>
                </div>
            </div>
        </>
      )

    if (error) {
        return (
            <>
                <div className="container mx-auto p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>Greška pri učitavanju podataka: {error}</p>
                </div>
                </div>
            </>
        );
    }

    return <div className="mt-10">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold my-5">Ranking Lists s</h2>
            <Plus onClick={() => setOpen(true)} />
        </div>
        <div className="border-2 p-5 rounded">
            {rankingList.length > 0 ? rankingList.map((list, index) => (
                <div key={index}>
                    <Link href={"/moderator/" + list.id}>{list.description}</Link>
                </div>
            )) : <p>Create new ranking list!</p>}
        </div>

        <RankingListModal isOpen={open} onClose={() => setOpen(false)} refresh={fetchData}/>

    </div>
}