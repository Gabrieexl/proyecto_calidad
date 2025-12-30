import { useEffect, useState, useRef } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, getDownloadURL, listAll, deleteObject, uploadString } from "firebase/storage";
import { app } from "../utils/firebase";
import { LoaderCircle, CheckCircle2, XCircle, Search, FileText, Download, ExternalLink, Calendar } from "lucide-react";
import jsPDF from "jspdf";
import { Trash2 } from "lucide-react";

const db = getFirestore(app);
const storage = getStorage(app);

type Cliente = {
    id: string;
    nombre?: string;
    // Agrega aquí otros campos que tenga un cliente
};

type ReporteCard = {
    clientes: Cliente[];
    pdfUrl?: string;
    pdfName?: string;
    createdAt?: Date;
    size?: number;
};

// Toast para feedback visual
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
    return (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-white transition-all animate-fade-in-down ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
            role="alert">
            {type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span className="font-semibold">{message}</span>
            <button onClick={onClose} className="ml-2 text-white hover:text-gray-200 focus:outline-none">✕</button>
        </div>
    );
}

export default function Reports() {
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [selectedClientes, setSelectedClientes] = useState<string[]>([]);
    const [reportes, setReportes] = useState<ReporteCard[]>([]);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Cargar clientes de Firestore solo cuando se abre el modal
    useEffect(() => {
        if (!showModal) return;
        setIsLoading(true);
        const fetchClientes = async () => {
            try {
                const snapshot = await getDocs(collection(db, "clientes"));
                setClientes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch {
                setToast({ message: "Error al cargar clientes", type: "error" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchClientes();
    }, [showModal]);

    // Cargar reportes guardados en Storage solo una vez al montar
    useEffect(() => {
        const fetchReportes = async () => {
            try {
                console.log("Iniciando carga de reportes...");
                const reportsRef = ref(storage, "reportes");
                const res = await listAll(reportsRef);
                console.log("Archivos encontrados:", res.items.length);
                
                const validCards: ReporteCard[] = [];
                
                for (const itemRef of res.items) {
                    console.log("Procesando archivo:", itemRef.name);
                    if (itemRef.name.endsWith(".pdf")) {
                        try {
                            const url = await getDownloadURL(itemRef);
                            console.log("URL obtenida para:", itemRef.name);
                            validCards.push({ 
                                clientes: [], 
                                pdfUrl: url, 
                                pdfName: itemRef.name 
                            });
                        } catch (error) {
                            console.error("Error obteniendo URL para", itemRef.name, error);
                            continue;
                        }
                    }
                }
                
                console.log("Reportes cargados exitosamente:", validCards.length);
                setReportes(validCards);
            } catch (error) {
                console.error("Error al cargar reportes:", error);
                const firebaseError = error as { code?: string; message?: string };
                
                if (firebaseError?.code === 'storage/unknown') {
                    console.log("Error storage/unknown - Posibles causas:");
                    console.log("1. Reglas de Storage muy restrictivas");
                    console.log("2. Problema de autenticación");
                    console.log("3. Configuración incorrecta de Firebase");
                    console.log("Inicializando con array vacío...");
                }
                
                // Cualquier error, simplemente inicializar con array vacío sin mostrar toast
                setReportes([]);
            }
        };
        fetchReportes();
    }, []);

    const handleCardClick = () => setShowModal(true);

    const handleCheckboxChange = (id: string) => {
        setSelectedClientes(prev =>
            prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
        );
    };

    // Generar y descargar PDF, subirlo a Storage y actualizar cards
    const handleGenerateReport = async (e: React.FormEvent) => {
        e.preventDefault();
        const selected = clientes.filter(c => selectedClientes.includes(c.id));
        if (selected.length === 0) {
            setToast({ message: "Selecciona al menos un cliente", type: "error" });
            return;
        }
        setIsLoading(true);
        try {
            // 1. Generar PDF con mejor formato
            const doc = new jsPDF();
            
            // Header del documento
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("REPORTE DE CLIENTES", 105, 25, { align: "center" });
            
            // Fecha del reporte
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const fecha = new Date().toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long", 
                day: "numeric"
            });
            doc.text(`Generado el: ${fecha}`, 105, 35, { align: "center" });
            
            // Línea separadora
            doc.setDrawColor(255, 193, 7); // Color amarillo
            doc.setLineWidth(1);
            doc.line(14, 45, 196, 45);
            
            let y = 60;
            
            selected.forEach((cliente, idx) => {
                // Verificar si necesitamos nueva página
                if (y > 250) {
                    doc.addPage();
                    y = 30;
                }
                
                // Título del cliente
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(255, 193, 7); // Color amarillo
                doc.text(`Cliente #${idx + 1}`, 14, y);
                
                y += 10;
                doc.setFont("helvetica", "normal");
                doc.setTextColor(0, 0, 0); // Negro
                doc.setFontSize(11);
                
                // Información del cliente
                Object.entries(cliente).forEach(([key, value]) => {
                    if (key !== "id" && value) {
                        const label = key.charAt(0).toUpperCase() + key.slice(1);
                        doc.text(`${label}:`, 20, y);
                        doc.text(`${value}`, 60, y);
                        y += 7;
                    }
                });
                
                // Línea separadora entre clientes
                if (idx < selected.length - 1) {
                    y += 5;
                    doc.setDrawColor(200, 200, 200);
                    doc.setLineWidth(0.5);
                    doc.line(20, y, 190, y);
                    y += 10;
                }
            });
            // 2. Descargar PDF localmente
            doc.save("reporte_clientes.pdf");
            // 3. Subir PDF a Firebase Storage
            const pdfBlob = doc.output("blob");
            const pdfName = `reporte_${Date.now()}.pdf`;
            const pdfRef = ref(storage, `reportes/${pdfName}`);
            await uploadString(pdfRef, await pdfBlob.text(), "raw", { contentType: "application/pdf" });
            // 4. Subir también el JSON (opcional, para mantener compatibilidad)
            const reporteData = JSON.stringify(selected);
            const reporteRef = ref(storage, `reportes/reporte_${Date.now()}.json`);
            await uploadString(reporteRef, reporteData, "raw", { contentType: "application/json" });
            // 5. Obtener URL del PDF y actualizar cards
            const pdfUrl = await getDownloadURL(pdfRef);
            setReportes(prev => [{ clientes: selected, pdfUrl, pdfName }, ...prev]);
            setToast({ message: "Reporte generado exitosamente", type: "success" });
            setShowModal(false);
            setSelectedClientes([]);
        } catch {
            setToast({ message: "Error al generar el reporte", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    // Eliminar reporte PDF y JSON de Firebase Storage
    const handleDeleteReport = async (pdfName?: string) => {
        if (!pdfName) return;
        setDeletingId(pdfName);
        try {
            const pdfRef = ref(storage, `reportes/${pdfName}`);
            await deleteObject(pdfRef);
            const jsonName = pdfName.replace(/\.pdf$/, ".json");
            const jsonRef = ref(storage, `reportes/${jsonName}`);
            try {
                await deleteObject(jsonRef);
            } catch { /* Puede no existir */ }
            setReportes(prev => prev.filter(r => r.pdfName !== pdfName));
            setToast({ message: "Reporte eliminado exitosamente", type: "success" });
        } catch {
            setToast({ message: "Error al eliminar el reporte", type: "error" });
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="h-full w-full flex flex-col">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            {/* Header con título y búsqueda */}
            <div className="flex-shrink-0 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-yellow-500" />
                        <h2 className="text-2xl font-bold text-gray-800">Reportes Generados</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar reportes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                            />
                        </div>
                        <button
                            onClick={handleCardClick}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-all shadow focus:outline-none focus:ring-2 focus:ring-yellow-300"
                            aria-label="Crear nuevo reporte"
                        >
                            <FileText className="w-4 h-4" />
                            Nuevo Reporte
                        </button>
                        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                            {reportes.length} {reportes.length === 1 ? 'reporte' : 'reportes'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenedor de reportes con scroll */}
            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {/* Mostrar reportes guardados */}
                    {reportes
                        .filter(reporte => 
                            !searchTerm || 
                            reporte.pdfName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            reporte.clientes.some(cliente => 
                                cliente.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                        )
                        .map((reporte, idx) => (
                        <div
                            key={idx}
                            className="aspect-square min-h-[250px] flex flex-col justify-between rounded-xl bg-white shadow-md hover:shadow-xl border border-gray-200 p-4 relative transition-all duration-200 group"
                        >
                            <button
                                type="button"
                                title="Eliminar reporte"
                                onClick={() => handleDeleteReport(reporte.pdfName)}
                                className="absolute top-3 right-3 bg-red-50 hover:bg-red-100 rounded-full p-2 transition-all z-10 focus:outline-none focus:ring-2 focus:ring-red-300 opacity-0 group-hover:opacity-100"
                                disabled={isLoading || deletingId === reporte.pdfName}
                                aria-label="Eliminar reporte"
                            >
                                {deletingId === reporte.pdfName ? (
                                    <LoaderCircle className="w-4 h-4 text-red-500 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                )}
                            </button>
                            <div className="flex flex-col h-full">
                                {/* Header del reporte */}
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText className="w-5 h-5 text-yellow-500" />
                                    <h4 className="text-gray-800 font-bold text-base truncate">
                                        Reporte #{idx + 1}
                                    </h4>
                                </div>

                                {/* Fecha de creación */}
                                <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date().toLocaleDateString()}</span>
                                </div>

                                {/* Lista de clientes */}
                                <div 
                                    className="flex-1 mb-4">
                                        <div className="text-xs text-gray-600 mb-2 font-medium">
                                            {Array.isArray(reporte.clientes) && reporte.clientes.length > 0
                                                ? `${reporte.clientes.length} cliente${reporte.clientes.length > 1 ? 's' : ''}`
                                                : 'PDF disponible'}
                                        </div>
                                        <div className="space-y-1 max-h-20 overflow-y-auto">
                                            {Array.isArray(reporte.clientes) && reporte.clientes.length > 0
                                                ? reporte.clientes.slice(0, 3).map((cliente, i) => (
                                                    <div
                                                        key={i}
                                                        className="bg-yellow-50 rounded px-2 py-1 text-xs text-gray-700 border border-yellow-100"
                                                    >
                                                        <span className="font-medium truncate block">
                                                            {cliente.nombre || cliente.id}
                                                        </span>
                                                    </div>
                                                ))
                                                : null}
                                            {Array.isArray(reporte.clientes) && reporte.clientes.length > 3 && (
                                                <div className="text-xs text-gray-500 italic px-2">
                                                    +{reporte.clientes.length - 3} más...
                                                </div>
                                            )}
                                        </div>
                                </div>

                                {/* Botones de acción */}
                                <div className="space-y-2 mt-auto">
                                    {reporte.pdfUrl && (
                                        <>
                                            <a
                                                href={reporte.pdfUrl}
                                                download={reporte.pdfName}
                                                className="flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded-lg font-medium text-xs hover:bg-yellow-600 transition-all shadow text-center w-full focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                            >
                                                <Download className="w-3 h-3" />
                                                Descargar
                                            </a>
                                            <a
                                                href={reporte.pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-yellow-400 text-yellow-600 rounded-lg font-medium text-xs hover:bg-yellow-50 transition-all shadow text-center w-full focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                Ver PDF
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        ))}
                </div>
                
                {/* Estado vacío cuando no hay reportes */}
                {reportes.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-gray-400 py-16">
                        <FileText className="w-16 h-16 mb-4 text-yellow-400" />
                        <span className="text-xl font-medium mb-2">No hay reportes generados</span>
                        <span className="text-sm text-gray-500 text-center max-w-md">
                            Comienza creando tu primer reporte haciendo clic en el botón &quot;Nuevo Reporte&quot;
                        </span>
                    </div>
                )}

                {/* Estado cuando la búsqueda no encuentra resultados */}
                {reportes.length > 0 && reportes.filter(reporte => 
                    !searchTerm || 
                    reporte.pdfName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    reporte.clientes.some(cliente => 
                        cliente.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                ).length === 0 && (
                    <div className="flex flex-col items-center justify-center text-gray-400 py-16">
                        <Search className="w-12 h-12 mb-4 text-yellow-400" />
                        <span className="text-lg font-medium mb-2">No se encontraron reportes</span>
                        <span className="text-sm text-gray-500">
                            Intenta con otros términos de búsqueda
                        </span>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
                    aria-modal="true" 
                    role="dialog"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget && !isLoading) {
                            setShowModal(false);
                        }
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !isLoading) {
                            setShowModal(false);
                        }
                    }}
                >
                    <div 
                        ref={modalRef} 
                        className="bg-white px-8 py-8 rounded-2xl max-w-md w-full max-h-[80vh] shadow-2xl border border-gray-100 relative animate-fade-in-down overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => !isLoading && setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Cerrar modal"
                            disabled={isLoading}
                        >
                            ×
                        </button>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <FileText className="w-6 h-6 text-yellow-500" />
                            <h3 className="text-yellow-600 font-bold text-xl">
                                Generar Nuevo Reporte
                            </h3>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-6">
                            Selecciona los clientes que deseas incluir en el reporte PDF
                        </p>
                        <form onSubmit={handleGenerateReport} className="flex flex-col h-full">
                            {/* Contador de clientes seleccionados */}
                            {!isLoading && clientes.length > 0 && (
                                <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700">
                                            {selectedClientes.length} de {clientes.length} clientes seleccionados
                                        </span>
                                        {selectedClientes.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setSelectedClientes([])}
                                                className="text-yellow-600 hover:text-yellow-700 font-medium"
                                            >
                                                Limpiar selección
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex-1 overflow-y-auto mb-6 pr-2 min-h-[200px] max-h-[300px]">
                                {isLoading ? (
                                    <div className="flex flex-col justify-center items-center h-full">
                                        <LoaderCircle className="animate-spin w-10 h-10 text-yellow-500 mb-3" />
                                        <span className="text-gray-600">Cargando clientes...</span>
                                    </div>
                                ) : clientes.length === 0 ? (
                                    <div className="flex flex-col justify-center items-center h-full text-center">
                                        <FileText className="w-12 h-12 text-gray-300 mb-3" />
                                        <span className="text-gray-500 font-medium">No hay clientes disponibles</span>
                                        <span className="text-gray-400 text-sm">Agrega clientes primero para generar reportes</span>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {clientes.map(cliente => (
                                            <label 
                                                key={cliente.id} 
                                                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault(); // Evita scroll con espacio
                                                        handleCheckboxChange(cliente.id);
                                                    }
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    tabIndex={-1} // Evita doble enfoque (ya enfocamos el label)
                                                    checked={selectedClientes.includes(cliente.id)}
                                                    onChange={() => handleCheckboxChange(cliente.id)}
                                                    className="w-4 h-4 text-yellow-500 rounded border-gray-300 focus:ring-yellow-400 focus:ring-2"
                                                    aria-checked={selectedClientes.includes(cliente.id)}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <span className="font-medium text-gray-900 truncate block">
                                                        {cliente.nombre || cliente.id}
                                                    </span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => !isLoading && setShowModal(false)}
                                    className="flex-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg px-4 py-2.5 font-medium hover:bg-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isLoading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-yellow-500 text-white rounded-lg px-4 py-2.5 font-medium shadow hover:bg-yellow-600 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isLoading || selectedClientes.length === 0}
                                >
                                    {isLoading ? (
                                        <>
                                            <LoaderCircle className="animate-spin w-4 h-4" />
                                            Generando...
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="w-4 h-4" />
                                            Generar PDF
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}