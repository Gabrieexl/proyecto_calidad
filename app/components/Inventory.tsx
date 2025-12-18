"use client";

import { useState, useEffect } from 'react';
import { Search, Package, Eye, Loader2, AlertCircle } from 'lucide-react';

// Tipos para tu API
type Producto = {
    id: string;
    imagen: string;
    nombre: string;
    descripcion: string;
};

type Categoria = {
    id: string;
    portada: string;
    nombre: string;
    descripcion: string;
    productos: Producto[];
};

export default function Inventory() {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);

    // Consumir la API
    useEffect(() => {
        const fetchInventory = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/inventory');
                
                if (!response.ok) {
                    throw new Error('Error al cargar el inventario');
                }
                
                const data: Categoria[] = await response.json();
                setCategorias(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error desconocido');
            } finally {
                setIsLoading(false);
            }
        };

        fetchInventory();
    }, []);

    // Filtrar categorías por búsqueda
    const categoriasFiltradas = categorias.filter(categoria =>
        categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categoria.productos.some(producto => 
            producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Obtener productos filtrados de una categoría específica
    const getProductosFiltrados = (categoria: Categoria) => {
        if (!searchTerm) return categoria.productos;
        return categoria.productos.filter(producto =>
            producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-yellow-600" />
                    <p className="text-gray-600">Cargando inventario...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
                    <p className="text-red-600 mb-2">Error al cargar el inventario</p>
                    <p className="text-gray-500 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header con búsqueda */}
            <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <Package className="w-6 h-6 text-yellow-600" />
                    <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>
                </div>
                
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar productos o categorías..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* Contenido principal con scroll */}
            <div className="flex-1 overflow-y-auto">
                {categoriasFiltradas.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">No se encontraron resultados</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {categoriasFiltradas.map((categoria) => {
                            const productosFiltrados = getProductosFiltrados(categoria);
                            
                            if (searchTerm && productosFiltrados.length === 0) return null;
                            
                            return (
                                <div key={categoria.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                                    {/* Header de categoría */}
                                    <div className="relative">
                                        <img
                                            src={categoria.portada}
                                            alt={categoria.nombre}
                                            className="w-full h-32 object-cover rounded-t-xl"
                                            onError={(e) => {
                                                e.currentTarget.src = '/placeholder-image.jpg';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-t-xl flex items-end">
                                            <div className="p-4 text-white">
                                                <h3 className="font-bold text-lg">{categoria.nombre}</h3>
                                                <p className="text-sm opacity-90">{categoria.descripcion}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lista de productos */}
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm text-gray-600 font-medium">
                                                {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}
                                            </span>
                                            <button
                                                onClick={() => setSelectedCategoria(
                                                    selectedCategoria === categoria.id ? null : categoria.id
                                                )}
                                                className="text-yellow-600 hover:text-yellow-700 transition-colors flex items-center gap-1 text-sm"
                                            >
                                                <Eye className="w-4 h-4" />
                                                {selectedCategoria === categoria.id ? 'Ocultar' : 'Ver todo'}
                                            </button>
                                        </div>

                                        {/* Productos preview o completo */}
                                        <div className="space-y-2">
                                            {(selectedCategoria === categoria.id ? productosFiltrados : productosFiltrados.slice(0, 3))
                                                .map((producto) => (
                                                <div
                                                    key={producto.id}
                                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    <img
                                                        src={producto.imagen}
                                                        alt={producto.nombre}
                                                        className="w-10 h-10 object-cover rounded-md"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/placeholder-product.jpg';
                                                        }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm text-gray-800 truncate">
                                                            {producto.nombre}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {producto.descripcion}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {selectedCategoria !== categoria.id && productosFiltrados.length > 3 && (
                                                <div className="text-center pt-2">
                                                    <span className="text-xs text-gray-400">
                                                        +{productosFiltrados.length - 3} productos más
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}