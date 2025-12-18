"use client";

import { useEffect, useState } from "react";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { UsersRound, UserPen, UserRoundCheck, UserRoundPlus, LoaderCircle } from 'lucide-react';

import PendingClients from './PendingClients';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../utils/firebase";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Home() {
    const [totalClients, setTotalClients] = useState(0);
    const [loading, setLoading] = useState(true);
    const [cotizados, setCotizados] = useState(0);
    const [pendientes, setPendientes] = useState(0);
    const [probables, setProbables] = useState(0);


    useEffect(() => {
        const fetchClientStats = async () => {
            const cached = localStorage.getItem("clientStatsCache");
            if (cached) {
                const { value, timestamp } = JSON.parse(cached);
                const now = Date.now();
                if (now - timestamp < 24 * 60 * 60 * 1000) {
                    setTotalClients(value.total);
                    setCotizados(value.cotizados);
                    setPendientes(value.pendientes);
                    setProbables(value.probables);
                    setLoading(false);
                    return;
                }
            }

            const db = getFirestore(app);
            const snapshot = await getDocs(collection(db, "clientes"));
            let total = 0;
            let cotizados = 0;
            let pendientes = 0;
            let probables = 0;

            snapshot.forEach(doc => {
                total++;
                const etapa = doc.data().etapa;
                if (etapa === "Cotizado") cotizados++;
                else if (etapa === "Contacto Inicial-1") pendientes++;
                else if (etapa === "Pendientes por Cotizar") probables++;
            });

            setTotalClients(total);
            setCotizados(cotizados);
            setPendientes(pendientes);
            setProbables(probables);
            setLoading(false);

            localStorage.setItem(
                "clientStatsCache",
                JSON.stringify({
                    value: { total, cotizados, pendientes, probables },
                    timestamp: Date.now()
                })
            );
        };
        fetchClientStats();
    }, []);
    
    const stats = [
        { icon: <UsersRound />, title: "Clientes totales", value: totalClients, loading },
        { icon: <UserRoundCheck />, title: "Clientes Cotizados", value: cotizados, loading },
        { icon: <UserPen />, title: "Clientes Pendientes", value: pendientes, loading },
        { icon: <UserRoundPlus />, title: "Clientes Probables", value: probables, loading },
    ];


    const chartData = {
        labels: stats.map(item => item.title),
        datasets: [
            {
                label: 'Clientes',
                data: stats.map(item => item.value),
                backgroundColor: [
                    '#60a5fa', '#34d399', '#fbbf24', '#f87171'
                ],
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Resumen de Clientes' },
        },
    };
    
    return (
        <section className='flex'>
            <div className='flex flex-col'>
                <h1 className="text-3xl font-bold">
                    Inicio
                </h1>
                <div className="flex flex-row gap-6 my-8">
                    {stats.map((item, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col items-center bg-white rounded-xl shadow-md px-6 py-4 min-w-[160px] border border-gray-100"
                        >
                            <div className="mb-2 text-yellow-500">{item.icon}</div>
                            <h6 className="text-sm font-semibold text-gray-600">{item.title}</h6>
                            <span className="text-xl font-bold text-gray-800">
                                {item.loading
                                    ? <LoaderCircle className="mt-2 size-5 animate-spin" />
                                    : item.value}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="w-full h-64 lg:h-85 mt-6 overflow-x-auto">
                    <Bar data={chartData} options={chartOptions} /> 
                </div>
            </div>
            <div className="flex flex-col mx-auto">
                <PendingClients />
            </div>
        </section>
    )
}