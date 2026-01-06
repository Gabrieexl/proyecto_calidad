"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  UsersRound,
  UserPen,
  UserRoundCheck,
  UserRoundPlus,
  LoaderCircle,
} from "lucide-react";

import PendingClients from "./PendingClients";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { app } from "../utils/firebase";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Home() {
  const [totalClients, setTotalClients] = useState(0);
  const [loading, setLoading] = useState(true);

  // Ajusta nombres/labels si quieres, pero estos contadores ahora dependen de TUS etapas reales
  const [finalizados, setFinalizados] = useState(0);
  const [contactoInicial, setContactoInicial] = useState(0);
  const [retomarContacto, setRetomarContacto] = useState(0);

  useEffect(() => {
    const db = getFirestore(app);

    // ✅ Tiempo real: se actualiza cuando agregas/editar clientes
    const unsub = onSnapshot(
      collection(db, "clientes"),
      (snapshot) => {
        let total = 0;
        let fin = 0;
        let ci = 0;
        let rc = 0;

        snapshot.forEach((doc) => {
          total++;
          const etapa = (doc.data().etapa || "").trim();

          // ✅ Etapas según tu proyecto
          if (etapa === "Finalizado") fin++;
          else if (etapa === "Contacto Inicial-1") ci++;
          else if (etapa === "Retomar Contacto") rc++;
        });

        setTotalClients(total);
        setFinalizados(fin);
        setContactoInicial(ci);
        setRetomarContacto(rc);
        setLoading(false);
      },
      (error) => {
        console.error("Error escuchando clientes:", error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const stats = [
    { icon: <UsersRound />, title: "Clientes totales", value: totalClients, loading },
    { icon: <UserRoundCheck />, title: "Finalizado", value: finalizados, loading },
    { icon: <UserPen />, title: "Contacto Inicial-1", value: contactoInicial, loading },
    { icon: <UserRoundPlus />, title: "Retomar Contacto", value: retomarContacto, loading },
  ];

  const chartData = {
    labels: stats.map((item) => item.title),
    datasets: [
      {
        label: "Clientes",
        data: stats.map((item) => item.value),
        backgroundColor: ["#60a5fa", "#34d399", "#fbbf24", "#f87171"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Resumen de Clientes" },
    },
  };

  return (
    <section className="flex">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold">Inicio</h1>

        <div className="flex flex-row gap-6 my-8">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center bg-white rounded-xl shadow-md px-6 py-4 min-w-[160px] border border-gray-100"
            >
              <div className="mb-2 text-yellow-500">{item.icon}</div>
              <h6 className="text-sm font-semibold text-gray-600">{item.title}</h6>
              <span className="text-xl font-bold text-gray-800">
                {item.loading ? (
                  <LoaderCircle className="mt-2 size-5 animate-spin" />
                ) : (
                  item.value
                )}
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
  );
}