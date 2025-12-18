import { FaLinkedin, FaGithub, FaBriefcase  } from "react-icons/fa";

export default function Author() {
  return (
    <section className="w-full h-full flex flex-col items-center justify-start p-6">
      <h1 className="text-3xl font-bold mb-6">Autor del Sistema CRM</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {/* Columna izquierda */}
        <div className="flex flex-col gap-6 col-span-1">
          {/* Perfil profesional */}
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Gabriel Polack</h2>
            <p className="text-gray-600 mb-4">
              Arquitecto de Software y fundador de BlackMount Corporation. Especializado en diseño de sistemas,
              desarrollo full stack y soluciones empresariales en la nube.
            </p>
            <p className="text-gray-500 text-sm">Lima, Perú · Desde 2022</p>
          </div>

          {/* Redes profesionales */}
          <div className="bg-yellow-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-yellow-100">
            <h2 className="text-xl font-semibold mb-4">Redes Profesionales</h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <FaLinkedin className="text-blue-700 text-xl" />
                <a
                  href="https://www.linkedin.com/in/gabriel-polack-castillo/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline"
                >
                  linkedin.com/in/gabriel-polack-castillo
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FaGithub className="text-gray-800 text-xl" />
                <a
                  href="https://github.com/ArcGabicho"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 hover:underline"
                >
                  github.com/ArcGabicho
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FaBriefcase className="text-green-600 text-xl" />
                <a
                  href="https://www.upwork.com/freelancers/~0180bc0ba4ba024471"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  upwork.com/freelancers/~gabrielpolack
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bento grande a la derecha */}
        <div className="bg-gray-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-gray-200 col-span-1 md:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Sobre este Sistema CRM</h2>
          <p className="text-gray-700 mb-4">
            Este sistema CRM fue concebido como una solución moderna, modular y altamente escalable para la empresa Compina S.A.C., con el objetivo de optimizar la gestión de sus relaciones comerciales. Nació como una reestructuración técnica del proyecto original, el cual no logró concluirse debido a una deficiente gestión operativa. Desarrollado con tecnologías como <strong>Next.js</strong> y <strong>Firebase</strong>, este sistema garantiza un alto rendimiento para uso en distintos entornos empresariales.
          </p>
          <ul className="list-disc pl-5 text-gray-600 space-y-2 mt-4">
            <li>Autenticación y login seguros mediante Firebase Auth.</li>
            <li>Consulta eficiente a Firestore con paginación y filtros dinámicos.</li>
            <li>Visualización de métricas y reportes con integración de Chart.js.</li>
            <li>Base de datos optimizada en Firestore con soporte para miles de clientes.</li>
            <li>Funciones core como registro, seguimiento, clasificación y recuperación de clientes.</li>
            <li>Proyecto open source bajo licencia MIT, libre para uso y distribución.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}